// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { discoverOIDCConfig } from '@better-auth/sso';
import type { PublicConfig } from 'shared-types';

const DEFAULT_AUTH_PROVIDER = 'github';
const DEFAULT_SSO_PROVIDER_ID = 'sso';
const DEFAULT_SSO_SCOPES = ['openid', 'profile', 'email'];
// Entra ID's oid is stable across apps in a tenant; other IdPs only send sub.
const DEFAULT_EXTERNAL_ID_CLAIM = 'oid';

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

function readBoolean(name: string, fallback: boolean) {
  const value = readEnv(name);

  if (value === undefined) {
    return fallback;
  }
  if (value !== 'true' && value !== 'false') {
    fail(`${name} must be true or false, got "${value}"`);
  }

  return value === 'true';
}

function parseIssuer(issuer: string) {
  try {
    const url = new URL(issuer);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return url;
    }
  } catch {}

  fail(`SSO_ISSUER must be an http(s) URL, got "${issuer}"`);
}

async function readSsoConfig() {
  const [issuer, clientId, clientSecret] = requireEnv('sso', ['SSO_ISSUER', 'SSO_CLIENT_ID', 'SSO_CLIENT_SECRET']);
  const issuerUrl = parseIssuer(issuer);
  const providerId = readEnv('SSO_PROVIDER_ID') ?? DEFAULT_SSO_PROVIDER_ID;
  const scopes = readList('SSO_SCOPES') ?? DEFAULT_SSO_SCOPES;
  const allowedClaim = readEnv('SSO_ALLOWED_CLAIM');
  const allowedClaimValues = readList('SSO_ALLOWED_CLAIM_VALUES');
  const externalIdClaim = readEnv('SSO_CLAIM_EXTERNAL_ID');
  const profileSync = readBoolean('IDENTITY_PROFILE_SYNC', true);

  if (!/^[a-z0-9-]+$/.test(providerId)) {
    fail(`SSO_PROVIDER_ID may only contain lowercase letters, numbers and hyphens, got "${providerId}"`);
  }
  // The ID token carries the subject, and the IdP only issues one for the openid scope.
  if (!scopes.includes('openid')) {
    fail('SSO_SCOPES must include openid');
  }
  if (!allowedClaim !== !allowedClaimValues) {
    fail('SSO_ALLOWED_CLAIM and SSO_ALLOWED_CLAIM_VALUES must be set together');
  }

  const discovery = await discoverOIDCConfig({
    issuer,
    isTrustedOrigin: (url: string) => new URL(url).origin === issuerUrl.origin,
  }).catch((error) => fail(`OpenID Connect discovery for ${issuer} failed: ${error.message}`));

  return {
    provider: { id: providerId, label: readEnv('SSO_LABEL'), kind: 'oidc' as const },
    sso: {
      providerId,
      issuerOrigin: issuerUrl.origin,
      externalIdClaim: externalIdClaim ?? DEFAULT_EXTERNAL_ID_CLAIM,
      // Only the default falls back, so an explicitly configured claim is never silently swapped for sub.
      externalIdFallbackToSub: !externalIdClaim,
      allowedEmailDomains: readList('SSO_ALLOWED_EMAIL_DOMAINS')?.map((domain) => domain.toLowerCase()),
      allowedClaim: allowedClaim && allowedClaimValues ? { name: allowedClaim, values: allowedClaimValues } : undefined,
      profileSync,
      oidcConfig: {
        issuer,
        clientId,
        clientSecret,
        pkce: true,
        scopes,
        overrideUserInfo: profileSync,
        discoveryEndpoint: discovery.discoveryEndpoint,
        authorizationEndpoint: discovery.authorizationEndpoint,
        tokenEndpoint: discovery.tokenEndpoint,
        jwksEndpoint: discovery.jwksEndpoint,
        userInfoEndpoint: discovery.userInfoEndpoint,
        tokenEndpointAuthentication: discovery.tokenEndpointAuthentication,
      },
    },
  };
}

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
