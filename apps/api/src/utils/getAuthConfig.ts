// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { AuthProvider, PublicConfig } from 'shared-types';

const DEFAULT_AUTH_PROVIDER = 'github';

const AUTH_PROVIDERS = {
  github: { label: 'GitHub', kind: 'social' },
} as const;

type AuthProviderId = keyof typeof AUTH_PROVIDERS;

interface AuthConfig {
  provider: AuthProvider & { id: AuthProviderId };
  socialProviders: Partial<Record<AuthProviderId, { clientId: string; clientSecret: string }>>;
}

let runtimeAuthConfig: AuthConfig | undefined;

function fail(message: string): never {
  throw new Error(`Invalid auth configuration: ${message}`);
}

function isAuthProviderId(id: string): id is AuthProviderId {
  return Object.hasOwn(AUTH_PROVIDERS, id);
}

function buildSocialCredentials(id: AuthProviderId) {
  const prefix = id.toUpperCase();
  const clientId = process.env[`${prefix}_CLIENT_ID`];
  const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];

  if (!clientId || !clientSecret) {
    const missing = [!clientId && `${prefix}_CLIENT_ID`, !clientSecret && `${prefix}_CLIENT_SECRET`].filter(Boolean);
    fail(`AUTH_PROVIDER=${id} requires ${missing.join(' and ')}`);
  }

  return { clientId, clientSecret };
}

function readAuthConfig() {
  const id = process.env.AUTH_PROVIDER || DEFAULT_AUTH_PROVIDER;

  if (!isAuthProviderId(id)) {
    fail(`AUTH_PROVIDER must be one of ${Object.keys(AUTH_PROVIDERS).join(', ')}, got "${id}"`);
  }

  return {
    provider: { id, ...AUTH_PROVIDERS[id] },
    socialProviders: { [id]: buildSocialCredentials(id) },
  };
}

export function initializeAuthConfig() {
  runtimeAuthConfig = readAuthConfig();
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
