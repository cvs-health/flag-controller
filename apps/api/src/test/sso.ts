// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { discoverOIDCConfig } from '@better-auth/sso';
import { vi } from 'vitest';

import { initializeAuthConfig } from '../utils/getAuthConfig.js';

export const issuer = 'https://sso.example.com/realms/corp';

/** What discovery returns for a Keycloak realm. */
export const discovery = {
  issuer,
  discoveryEndpoint: `${issuer}/.well-known/openid-configuration`,
  authorizationEndpoint: `${issuer}/protocol/openid-connect/auth`,
  tokenEndpoint: `${issuer}/protocol/openid-connect/token`,
  jwksEndpoint: `${issuer}/protocol/openid-connect/certs`,
  userInfoEndpoint: `${issuer}/protocol/openid-connect/userinfo`,
  tokenEndpointAuthentication: 'client_secret_basic' as const,
};

export const clientSecret = 'q8Vn2rT5yLm0WcX4bHj7KzP1sD3fGa6E';

/** Sets AUTH_PROVIDER=sso with the required variables, plus any overrides, and stubs discovery. */
export function stubSsoEnv(env: Record<string, string> = {}) {
  const values = {
    AUTH_PROVIDER: 'sso',
    SSO_ISSUER: issuer,
    SSO_CLIENT_ID: 'flag-controller',
    SSO_CLIENT_SECRET: clientSecret,
    ...env,
  };
  for (const [name, value] of Object.entries(values)) {
    vi.stubEnv(name, value);
  }
  vi.mocked(discoverOIDCConfig).mockResolvedValue(discovery);
}

export async function loadSsoConfig(env: Record<string, string> = {}) {
  stubSsoEnv(env);
  const config = await initializeAuthConfig();

  if (!('sso' in config)) {
    throw new Error('Expected AUTH_PROVIDER=sso to produce an SSO config');
  }

  return config.sso;
}
