// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAuthConfig, getPublicConfig, initializeAuthConfig } from '../getAuthConfig.js';

describe('getAuthConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    initializeAuthConfig();
  });

  it('defaults to GitHub when AUTH_PROVIDER is unset', () => {
    vi.stubEnv('AUTH_PROVIDER', undefined);

    expect(initializeAuthConfig()).toEqual({
      provider: { id: 'github', label: 'GitHub', kind: 'social' },
      socialProviders: {
        github: { clientId: 'test-github-client-id', clientSecret: 'test-github-client-secret' },
      },
    });
  });

  it('returns the config stored by initializeAuthConfig', () => {
    const config = initializeAuthConfig();

    expect(getAuthConfig()).toBe(config);
  });

  it('rejects an unknown AUTH_PROVIDER and lists the supported ones', () => {
    vi.stubEnv('AUTH_PROVIDER', 'nope');

    expect(() => initializeAuthConfig()).toThrow(
      'Invalid auth configuration: AUTH_PROVIDER must be one of github, got "nope"',
    );
  });

  it.each([
    ['GITHUB_CLIENT_ID', 'requires GITHUB_CLIENT_ID'],
    ['GITHUB_CLIENT_SECRET', 'requires GITHUB_CLIENT_SECRET'],
  ])('names %s when it is missing', (name, message) => {
    vi.stubEnv(name, '');

    expect(() => initializeAuthConfig()).toThrow(`AUTH_PROVIDER=github ${message}`);
  });

  it('names both credentials when both are missing', () => {
    vi.stubEnv('GITHUB_CLIENT_ID', '');
    vi.stubEnv('GITHUB_CLIENT_SECRET', '');

    expect(() => initializeAuthConfig()).toThrow('requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET');
  });

  it('throws when read before initialization', async () => {
    vi.resetModules();
    const fresh = await import('../getAuthConfig.js');

    expect(() => fresh.getAuthConfig()).toThrow('Auth configuration read before initializeAuthConfig() ran');
  });
});

describe('getPublicConfig', () => {
  it('reports the provider without its credentials', () => {
    const publicConfig = getPublicConfig();

    expect(publicConfig).toEqual({
      authProviders: [{ id: 'github', label: 'GitHub', kind: 'social' }],
      features: {},
      modes: {},
    });
    expect(JSON.stringify(publicConfig)).not.toContain('test-github-client');
  });
});
