// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import { discovery, issuer } from 'test/sso.js';

vi.mock('better-auth/adapters/drizzle', async (importOriginal) => {
  const actual = await importOriginal<typeof import('better-auth/adapters/drizzle')>();
  return { drizzleAdapter: vi.fn(actual.drizzleAdapter) };
});

// auth.ts reads the config when it loads, so each test loads a fresh copy after configuring.
async function loadAuth(configure: (fresh: typeof import('test/sso.js')) => Promise<unknown>) {
  vi.resetModules();
  await configure(await import('test/sso.js'));

  const { auth } = await import('../auth.js');
  const { drizzleAdapter } = await import('better-auth/adapters/drizzle');
  const ssoPlugin = auth.options.plugins?.find((plugin) => plugin.id === 'sso');

  return { options: auth.options, drizzleAdapter, ssoPlugin };
}

async function loadAuthWithGithub() {
  return loadAuth(async () => (await import('../utils/getAuthConfig.js')).initializeAuthConfig());
}

async function loadAuthWithSso(env: Record<string, string> = {}) {
  return loadAuth((fresh) => fresh.loadSsoConfig(env));
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('auth with AUTH_PROVIDER=github', () => {
  it('registers GitHub and no SSO provider', async () => {
    const { options, ssoPlugin } = await loadAuthWithGithub();

    expect(options.socialProviders).toEqual({
      github: { clientId: 'test-github-client-id', clientSecret: 'test-github-client-secret' },
    });
    expect(ssoPlugin).toBeUndefined();
    expect(options.trustedOrigins).not.toContain('https://sso.example.com');
  });
});

describe('auth with AUTH_PROVIDER=sso', () => {
  it('registers one OpenID Connect provider from the environment', async () => {
    const { options, ssoPlugin } = await loadAuthWithSso();

    expect(options.socialProviders).toEqual({});
    expect(ssoPlugin?.options).toMatchObject({
      defaultSSO: [
        {
          providerId: 'sso',
          domain: 'sso.example.com',
          oidcConfig: { issuer, clientId: 'flag-controller', tokenEndpoint: discovery.tokenEndpoint, pkce: true },
        },
      ],
      providersLimit: 0,
      provisionUserOnEveryLogin: true,
      resolveUser: expect.any(Function),
      provisionUser: expect.any(Function),
    });
  });

  it('trusts the issuer origin so the plugin can reach the IdP', async () => {
    const { options } = await loadAuthWithSso();

    expect(options.trustedOrigins).toContain('https://sso.example.com');
  });

  it('turns on database transactions, which resolveUser requires', async () => {
    const { drizzleAdapter } = await loadAuthWithSso();

    expect(drizzleAdapter).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ transaction: true }));
  });

  it('declares external_id as a user field that sign-up input cannot set', async () => {
    const { options } = await loadAuthWithSso();

    expect(options.user?.additionalFields?.externalId).toEqual({ type: 'string', required: false, input: false });
  });
});
