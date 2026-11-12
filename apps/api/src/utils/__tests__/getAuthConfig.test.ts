// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { discoverOIDCConfig } from '@better-auth/sso';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getAuthConfig, getPublicConfig, initializeAuthConfig } from '../getAuthConfig.js';

const issuer = 'https://idp.example.com/realms/corp';

const discovered = {
  issuer,
  discoveryEndpoint: `${issuer}/.well-known/openid-configuration`,
  authorizationEndpoint: `${issuer}/protocol/openid-connect/auth`,
  tokenEndpoint: `${issuer}/protocol/openid-connect/token`,
  jwksEndpoint: `${issuer}/protocol/openid-connect/certs`,
  userInfoEndpoint: `${issuer}/protocol/openid-connect/userinfo`,
  tokenEndpointAuthentication: 'client_secret_basic' as const,
};

function stubSso(env: Record<string, string | undefined> = {}) {
  const values = {
    AUTH_PROVIDER: 'sso',
    SSO_ISSUER: issuer,
    SSO_CLIENT_ID: 'sso-client-id',
    SSO_CLIENT_SECRET: 'sso-client-secret',
    ...env,
  };
  for (const [name, value] of Object.entries(values)) {
    vi.stubEnv(name, value);
  }
}

beforeEach(() => {
  vi.mocked(discoverOIDCConfig).mockResolvedValue(discovered);
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await initializeAuthConfig();
});

describe('getAuthConfig', () => {
  it('defaults to GitHub when AUTH_PROVIDER is unset', async () => {
    vi.stubEnv('AUTH_PROVIDER', undefined);

    expect(await initializeAuthConfig()).toEqual({
      provider: { id: 'github', label: 'GitHub', kind: 'social' },
      socialProviders: {
        github: { clientId: 'test-github-client-id', clientSecret: 'test-github-client-secret' },
      },
    });
  });

  it('returns the config stored by initializeAuthConfig', async () => {
    const config = await initializeAuthConfig();

    expect(getAuthConfig()).toBe(config);
  });

  it('rejects an unknown AUTH_PROVIDER and lists the supported ones', async () => {
    vi.stubEnv('AUTH_PROVIDER', 'nope');

    await expect(initializeAuthConfig()).rejects.toThrow(
      'Invalid auth configuration: AUTH_PROVIDER must be one of github, sso, got "nope"',
    );
  });

  it.each(['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'])('names %s when it is missing', async (name) => {
    vi.stubEnv(name, '');

    await expect(initializeAuthConfig()).rejects.toThrow(`AUTH_PROVIDER=github requires ${name}`);
  });

  it('names both GitHub credentials when both are missing', async () => {
    vi.stubEnv('GITHUB_CLIENT_ID', '');
    vi.stubEnv('GITHUB_CLIENT_SECRET', '');

    await expect(initializeAuthConfig()).rejects.toThrow('requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET');
  });

  it('throws when read before initialization', async () => {
    vi.resetModules();
    const fresh = await import('../getAuthConfig.js');

    expect(() => fresh.getAuthConfig()).toThrow('Auth configuration read before initializeAuthConfig() ran');
  });
});

describe('getAuthConfig with AUTH_PROVIDER=sso', () => {
  it('needs only the issuer, client id and secret, and fills endpoints from discovery', async () => {
    stubSso();

    expect(await initializeAuthConfig()).toEqual({
      provider: { id: 'sso', label: undefined, kind: 'oidc' },
      sso: {
        providerId: 'sso',
        issuerOrigin: 'https://idp.example.com',
        externalIdClaim: 'oid',
        externalIdFallbackToSub: true,
        allowedEmailDomains: undefined,
        allowedClaim: undefined,
        profileSync: true,
        oidcConfig: {
          issuer,
          clientId: 'sso-client-id',
          clientSecret: 'sso-client-secret',
          pkce: true,
          scopes: ['openid', 'profile', 'email'],
          overrideUserInfo: true,
          discoveryEndpoint: discovered.discoveryEndpoint,
          authorizationEndpoint: discovered.authorizationEndpoint,
          tokenEndpoint: discovered.tokenEndpoint,
          jwksEndpoint: discovered.jwksEndpoint,
          userInfoEndpoint: discovered.userInfoEndpoint,
          tokenEndpointAuthentication: 'client_secret_basic',
        },
      },
    });
  });

  it('only trusts the issuer origin for discovery', async () => {
    stubSso();
    await initializeAuthConfig();

    const { isTrustedOrigin } = vi.mocked(discoverOIDCConfig).mock.calls[0][0];

    expect(isTrustedOrigin?.(`${issuer}/.well-known/openid-configuration`)).toBe(true);
    expect(isTrustedOrigin?.('https://evil.example.com/keys')).toBe(false);
  });

  it('reads the optional settings', async () => {
    stubSso({
      SSO_PROVIDER_ID: 'corp',
      SSO_LABEL: 'App Registry',
      SSO_SCOPES: 'openid, email',
      SSO_CLAIM_EXTERNAL_ID: 'employee_id',
      SSO_ALLOWED_EMAIL_DOMAINS: 'Example.com, example.org',
      SSO_ALLOWED_CLAIM: 'tid',
      SSO_ALLOWED_CLAIM_VALUES: 'tenant-a,tenant-b',
      IDENTITY_PROFILE_SYNC: 'false',
    });

    const config = await initializeAuthConfig();

    expect(config.provider).toEqual({ id: 'corp', label: 'App Registry', kind: 'oidc' });
    expect(config).toMatchObject({
      sso: {
        providerId: 'corp',
        externalIdClaim: 'employee_id',
        externalIdFallbackToSub: false,
        allowedEmailDomains: ['example.com', 'example.org'],
        allowedClaim: { name: 'tid', values: ['tenant-a', 'tenant-b'] },
        profileSync: false,
        oidcConfig: { scopes: ['openid', 'email'], overrideUserInfo: false },
      },
    });
  });

  it('names every missing required variable', async () => {
    stubSso({ SSO_ISSUER: '', SSO_CLIENT_ID: '', SSO_CLIENT_SECRET: '' });

    await expect(initializeAuthConfig()).rejects.toThrow(
      'AUTH_PROVIDER=sso requires SSO_ISSUER, SSO_CLIENT_ID and SSO_CLIENT_SECRET',
    );
  });

  it.each(['SSO_ISSUER', 'SSO_CLIENT_ID', 'SSO_CLIENT_SECRET'])('names %s when it is missing', async (name) => {
    stubSso({ [name]: '' });

    await expect(initializeAuthConfig()).rejects.toThrow(`AUTH_PROVIDER=sso requires ${name}`);
  });

  it('fails with the IdP error when discovery fails', async () => {
    stubSso();
    vi.mocked(discoverOIDCConfig).mockRejectedValue(new Error('Discovery endpoint returned 404'));

    await expect(initializeAuthConfig()).rejects.toThrow(
      `OpenID Connect discovery for ${issuer} failed: Discovery endpoint returned 404`,
    );
  });

  it.each([
    [{ SSO_ISSUER: 'not a url' }, 'SSO_ISSUER must be an http(s) URL, got "not a url"'],
    [{ SSO_ISSUER: 'ftp://idp.example.com' }, 'SSO_ISSUER must be an http(s) URL'],
    [{ SSO_PROVIDER_ID: 'Corp SSO' }, 'SSO_PROVIDER_ID may only contain lowercase letters, numbers and hyphens'],
    [{ SSO_SCOPES: 'profile,email' }, 'SSO_SCOPES must include openid'],
    [{ SSO_ALLOWED_CLAIM: 'tid' }, 'SSO_ALLOWED_CLAIM and SSO_ALLOWED_CLAIM_VALUES must be set together'],
    [{ SSO_ALLOWED_CLAIM_VALUES: 'tenant-a' }, 'SSO_ALLOWED_CLAIM and SSO_ALLOWED_CLAIM_VALUES must be set together'],
    [{ IDENTITY_PROFILE_SYNC: 'yes' }, 'IDENTITY_PROFILE_SYNC must be true or false, got "yes"'],
  ])('rejects %o', async (env, message) => {
    stubSso(env);

    await expect(initializeAuthConfig()).rejects.toThrow(message);
  });
});

describe('getPublicConfig', () => {
  it('reports the GitHub provider without its credentials', () => {
    const publicConfig = getPublicConfig();

    expect(publicConfig).toEqual({
      authProviders: [{ id: 'github', label: 'GitHub', kind: 'social' }],
      features: {},
      modes: {},
    });
    expect(JSON.stringify(publicConfig)).not.toContain('test-github-client');
  });

  it('reports the SSO provider without its credentials or issuer settings', async () => {
    stubSso({ SSO_PROVIDER_ID: 'corp' });
    await initializeAuthConfig();

    const publicConfig = getPublicConfig();

    expect(publicConfig.authProviders).toEqual([{ id: 'corp', kind: 'oidc' }]);
    expect(JSON.stringify(publicConfig)).not.toMatch(/sso-client|idp\.example\.com/);
  });
});
