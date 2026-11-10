// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { AuthProvider, PublicConfig } from 'shared-types';

const DEFAULT_AUTH_PROVIDER = 'github';

/** Credentials passed straight to Better Auth's `socialProviders[id]`. */
interface SocialProviderCredentials {
  clientId: string;
  clientSecret: string;
}

const AUTH_PROVIDERS = {
  github: { label: 'GitHub', kind: 'social' },
} as const satisfies Record<string, Omit<AuthProvider, 'id'>>;

type AuthProviderId = keyof typeof AUTH_PROVIDERS;

interface AuthConfig {
  provider: AuthProvider & { id: AuthProviderId };
  socialProviders: Partial<Record<AuthProviderId, SocialProviderCredentials>>;
}

let runtimeAuthConfig: AuthConfig | undefined;

function fail(message: string): never {
  throw new Error(`Invalid auth configuration: ${message}`);
}

function isAuthProviderId(id: string): id is AuthProviderId {
  return Object.hasOwn(AUTH_PROVIDERS, id);
}

function buildSocialCredentials(env: NodeJS.ProcessEnv, id: AuthProviderId): SocialProviderCredentials {
  const prefix = id.toUpperCase();
  const missing = [`${prefix}_CLIENT_ID`, `${prefix}_CLIENT_SECRET`].filter((name) => !env[name]);

  if (missing.length) {
    fail(`AUTH_PROVIDER=${id} requires ${missing.join(' and ')}`);
  }

  return {
    clientId: env[`${prefix}_CLIENT_ID`] as string,
    clientSecret: env[`${prefix}_CLIENT_SECRET`] as string,
  };
}

export function readAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  const id = env.AUTH_PROVIDER || DEFAULT_AUTH_PROVIDER;

  if (!isAuthProviderId(id)) {
    fail(`AUTH_PROVIDER must be one of ${Object.keys(AUTH_PROVIDERS).join(', ')}, got "${id}"`);
  }

  return {
    provider: { id, ...AUTH_PROVIDERS[id] },
    socialProviders: { [id]: buildSocialCredentials(env, id) },
  };
}

export function initializeAuthConfig(env: NodeJS.ProcessEnv = process.env) {
  runtimeAuthConfig = readAuthConfig(env);
  return runtimeAuthConfig;
}

export function getAuthConfig() {
  return runtimeAuthConfig ?? initializeAuthConfig();
}

export function getPublicConfig(): PublicConfig {
  const { provider } = getAuthConfig();

  return { authProviders: [provider], features: {}, modes: {} };
}
