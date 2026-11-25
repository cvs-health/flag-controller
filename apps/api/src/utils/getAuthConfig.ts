// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { discoverOIDCConfig } from '@better-auth/sso';
import type { PublicConfig } from 'shared-types';

const DEFAULT_AUTH_PROVIDER = 'github';
const SSO_PROVIDER_ID = 'sso';
const DEFAULT_SSO_SCOPES = ['openid', 'profile', 'email'];
// Entra ID sends oid; other IdPs only send sub.
const DEFAULT_EXTERNAL_ID_CLAIMS = ['oid', 'sub'];

const AUTH_PROVIDERS = {
  github: readGithubConfig,
  sso: readSsoConfig,
};

let runtimeAuthConfig: Awaited<ReturnType<typeof readAuthConfig>> | undefined;

function fail(message: string): never {
  throw new Error(`Invalid auth configuration: ${message}`);
}

function readEnv(name: string) {
  return process.env[name]?.trim() || undefined;
}

function readList(name: string) {
  return readEnv(name)
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function joinNames(names: string[]) {
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
}

function requireEnv(provider: string, names: string[]) {
  const values = names.map(readEnv);
  const missing = names.filter((_, index) => !values[index]);

  if (missing.length) {
    fail(`AUTH_PROVIDER=${provider} requires ${joinNames(missing)}`);
  }

  return values as string[];
}

function readGithubConfig() {
  const [clientId, clientSecret] = requireEnv('github', ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET']);

  return {
    provider: { id: 'github', label: 'GitHub', kind: 'social' as const },
    socialProviders: { github: { clientId, clientSecret } },
  };
}

async function readSsoConfig() {
  const [issuer, clientId, clientSecret] = requireEnv('sso', ['SSO_ISSUER', 'SSO_CLIENT_ID', 'SSO_CLIENT_SECRET']);
  const issuerOrigin = URL.parse(issuer)?.origin ?? fail(`SSO_ISSUER must be a URL, got "${issuer}"`);
  const scopes = readList('SSO_SCOPES') ?? DEFAULT_SSO_SCOPES;
  const externalIdClaim = readEnv('SSO_CLAIM_EXTERNAL_ID');
  const allowedClaim = readEnv('SSO_ALLOWED_CLAIM');
  const allowedClaimValues = readList('SSO_ALLOWED_CLAIM_VALUES');

  // Without openid the IdP issues no ID token, and users are matched by its subject.
  if (!scopes.includes('openid')) {
    fail('SSO_SCOPES must include openid');
  }
  if (!allowedClaim !== !allowedClaimValues) {
    fail('SSO_ALLOWED_CLAIM and SSO_ALLOWED_CLAIM_VALUES must be set together');
  }

  const discovery = await discoverOIDCConfig({
    issuer,
    isTrustedOrigin: (url) => new URL(url).origin === issuerOrigin,
  }).catch((error) => fail(`OpenID Connect discovery for ${issuer} failed: ${error.message}`));

  return {
    provider: { id: SSO_PROVIDER_ID, label: readEnv('SSO_LABEL'), kind: 'oidc' as const },
    sso: {
      providerId: SSO_PROVIDER_ID,
      issuerOrigin,
      // A configured claim gets no fallback, so a missing claim can't quietly create a second user.
      externalIdClaims: externalIdClaim ? [externalIdClaim] : DEFAULT_EXTERNAL_ID_CLAIMS,
      allowedEmailDomains: readList('SSO_ALLOWED_EMAIL_DOMAINS')?.map((domain) => domain.toLowerCase()),
      allowedClaim: allowedClaim && allowedClaimValues ? { name: allowedClaim, values: allowedClaimValues } : undefined,
      oidcConfig: { ...discovery, issuer, clientId, clientSecret, pkce: true, scopes, overrideUserInfo: true },
    },
  };
}

export type SsoConfig = Awaited<ReturnType<typeof readSsoConfig>>['sso'];

function isAuthProviderId(id: string): id is keyof typeof AUTH_PROVIDERS {
  return Object.hasOwn(AUTH_PROVIDERS, id);
}

async function readAuthConfig() {
  const id = readEnv('AUTH_PROVIDER') ?? DEFAULT_AUTH_PROVIDER;

  if (!isAuthProviderId(id)) {
    fail(`AUTH_PROVIDER must be one of ${Object.keys(AUTH_PROVIDERS).join(', ')}, got "${id}"`);
  }

  return AUTH_PROVIDERS[id]();
}

export async function initializeAuthConfig() {
  runtimeAuthConfig = await readAuthConfig();
  return runtimeAuthConfig;
}

export function getAuthConfig() {
  if (!runtimeAuthConfig) {
    throw new Error('Auth configuration read before initializeAuthConfig() ran');
  }

  return runtimeAuthConfig;
}

export function getPublicConfig(): PublicConfig {
  const { provider } = getAuthConfig();

  return { authProviders: [provider], features: {}, modes: {} };
}
