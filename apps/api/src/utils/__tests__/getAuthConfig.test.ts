// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { discoverOIDCConfig } from '@better-auth/sso';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clientSecret, discovery, issuer, loadSsoConfig, stubSsoEnv } from 'test/sso.js';
import { localIdentityModes } from 'test/testUtils.js';
import { getAuthConfig, getPublicConfig, initializeAuthConfig } from '../getAuthConfig.js';

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
      identity: { modes: localIdentityModes, defaultTeam: true },
    });
  });

  it('fails startup on an invalid identity setting', async () => {
    vi.stubEnv('IDENTITY_TEAMS_MODE', 'external');

    await expect(initializeAuthConfig()).rejects.toThrow('IDENTITY_TEAMS_MODE=external needs a provisioning source');
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

  it.each([
    ['GITHUB_CLIENT_ID', 'requires GITHUB_CLIENT_ID'],
    ['GITHUB_CLIENT_SECRET', 'requires GITHUB_CLIENT_SECRET'],
  ])('names %s when it is missing', async (name, message) => {
    vi.stubEnv(name, '');

    await expect(initializeAuthConfig()).rejects.toThrow(`AUTH_PROVIDER=github ${message}`);
  });

  it('names both credentials when both are missing', async () => {
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
  beforeEach(() => {
    stubSsoEnv();
  });

  it('needs only the issuer, client id and secret, and takes endpoints from discovery', async () => {
    expect(await initializeAuthConfig()).toEqual({
      provider: { id: 'sso', label: undefined, kind: 'oidc' },
      sso: {
        providerId: 'sso',
        issuerOrigin: 'https://sso.example.com',
        externalIdClaims: ['oid', 'sub'],
        allowedEmailDomains: undefined,
        allowedClaim: undefined,
        oidcConfig: {
          ...discovery,
          clientId: 'flag-controller',
          clientSecret,
          pkce: true,
          scopes: ['openid', 'profile', 'email'],
          overrideUserInfo: true,
        },
      },
      identity: { modes: localIdentityModes, defaultTeam: true },
    });
  });

  it('only trusts the issuer origin during discovery', async () => {
    await initializeAuthConfig();

    const { isTrustedOrigin } = vi.mocked(discoverOIDCConfig).mock.calls[0][0];

    expect(isTrustedOrigin?.(discovery.discoveryEndpoint)).toBe(true);
    expect(isTrustedOrigin?.('https://attacker.example.net/certs')).toBe(false);
  });

  it('reads the optional settings', async () => {
    const sso = await loadSsoConfig({
      SSO_LABEL: 'App Registry',
      SSO_SCOPES: 'openid, email',
      SSO_CLAIM_EXTERNAL_ID: 'employee_id',
      SSO_ALLOWED_EMAIL_DOMAINS: 'Contoso.com, fabrikam.com',
      SSO_ALLOWED_CLAIM: 'tid',
      SSO_ALLOWED_CLAIM_VALUES: '4b1c6f0e-9d3a-4e7b-8a2c-1f5d9e0b7c34',
    });

    expect(getPublicConfig().authProviders).toEqual([{ id: 'sso', label: 'App Registry', kind: 'oidc' }]);
    expect(sso).toMatchObject({
      externalIdClaims: ['employee_id'],
      allowedEmailDomains: ['contoso.com', 'fabrikam.com'],
      allowedClaim: { name: 'tid', values: ['4b1c6f0e-9d3a-4e7b-8a2c-1f5d9e0b7c34'] },
      oidcConfig: { scopes: ['openid', 'email'] },
    });
  });

  it('names every missing required variable', async () => {
    stubSsoEnv({ SSO_ISSUER: '', SSO_CLIENT_ID: '', SSO_CLIENT_SECRET: '' });

    await expect(initializeAuthConfig()).rejects.toThrow(
      'AUTH_PROVIDER=sso requires SSO_ISSUER, SSO_CLIENT_ID and SSO_CLIENT_SECRET',
    );
  });

  it('fails with the IdP error when discovery fails', async () => {
    vi.mocked(discoverOIDCConfig).mockRejectedValue(new Error('Discovery endpoint not found'));

    await expect(initializeAuthConfig()).rejects.toThrow(
      `OpenID Connect discovery for ${issuer} failed: Discovery endpoint not found`,
    );
  });

  it.each([
    [{ SSO_ISSUER: 'sso.example.com/realms/corp' }, 'SSO_ISSUER must be a URL, got "sso.example.com/realms/corp"'],
    [{ SSO_SCOPES: 'profile,email' }, 'SSO_SCOPES must include openid'],
    [{ SSO_ALLOWED_CLAIM: 'tid' }, 'SSO_ALLOWED_CLAIM and SSO_ALLOWED_CLAIM_VALUES must be set together'],
    [
      { SSO_ALLOWED_CLAIM_VALUES: 'contoso.com' },
      'SSO_ALLOWED_CLAIM and SSO_ALLOWED_CLAIM_VALUES must be set together',
    ],
  ])('rejects %o', async (env, message) => {
    stubSsoEnv(env);

    await expect(initializeAuthConfig()).rejects.toThrow(message);
  });
});

describe('getPublicConfig', () => {
  it('reports the GitHub provider and identity modes without credentials', () => {
    const publicConfig = getPublicConfig();

    expect(publicConfig).toEqual({
      authProviders: [{ id: 'github', label: 'GitHub', kind: 'social' }],
      features: {},
      modes: localIdentityModes,
    });
    expect(JSON.stringify(publicConfig)).not.toContain('test-github-client');
  });

  it('reports the SSO provider without its credentials or issuer', async () => {
    await loadSsoConfig();

    const publicConfig = getPublicConfig();

    expect(publicConfig.authProviders).toEqual([{ id: 'sso', kind: 'oidc' }]);
    expect(JSON.stringify(publicConfig)).not.toContain(clientSecret);
    expect(JSON.stringify(publicConfig)).not.toContain('sso.example.com');
  });
});
