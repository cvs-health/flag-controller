// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { discoverOIDCConfig } from '@better-auth/sso';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { initializeAuthConfig } from '../getAuthConfig.js';
import { createProvisionSsoUser, createResolveSsoUser, getExternalId, getSignInRestriction } from '../ssoUser.js';

type ResolveInput = Parameters<ReturnType<typeof createResolveSsoUser>>[0];
type ResolveContext = Parameters<ReturnType<typeof createResolveSsoUser>>[1];
type ProvisionInput = Parameters<ReturnType<typeof createProvisionSsoUser>>[0];

async function ssoConfig(env: Record<string, string> = {}) {
  const values = {
    AUTH_PROVIDER: 'sso',
    SSO_ISSUER: 'https://idp.example.com',
    SSO_CLIENT_ID: 'id',
    SSO_CLIENT_SECRET: 'secret',
    ...env,
  };
  for (const [name, value] of Object.entries(values)) {
    vi.stubEnv(name, value);
  }
  vi.mocked(discoverOIDCConfig).mockResolvedValue({
    issuer: 'https://idp.example.com',
    discoveryEndpoint: 'https://idp.example.com/.well-known/openid-configuration',
    authorizationEndpoint: 'https://idp.example.com/authorize',
    tokenEndpoint: 'https://idp.example.com/token',
    jwksEndpoint: 'https://idp.example.com/jwks',
  });

  const config = await initializeAuthConfig();
  if (!('sso' in config)) {
    throw new Error('expected an SSO config');
  }

  return config.sso;
}

function resolveInput(claims: Record<string, unknown>, email = 'ada@example.com') {
  return {
    protocol: 'oidc',
    providerUser: { email },
    verifiedIdTokenClaims: claims,
  } as unknown as ResolveInput;
}

function databaseWith(user?: { id: string }) {
  const findOne = vi.fn().mockResolvedValue(user ?? null);
  return { findOne, context: { database: { findOne } } as unknown as ResolveContext };
}

function idToken(claims: Record<string, unknown>) {
  return `header.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`;
}

afterEach(async () => {
  vi.unstubAllEnvs();
  await initializeAuthConfig();
});

describe('getExternalId', () => {
  it('prefers oid by default', async () => {
    expect(getExternalId(await ssoConfig(), { oid: 'object-1', sub: 'subject-1' })).toBe('object-1');
  });

  it('falls back to sub by default when the IdP sends no oid', async () => {
    expect(getExternalId(await ssoConfig(), { sub: 'subject-1' })).toBe('subject-1');
  });

  it('uses a configured claim without falling back to sub', async () => {
    const sso = await ssoConfig({ SSO_CLAIM_EXTERNAL_ID: 'employee_id' });

    expect(getExternalId(sso, { employee_id: 'e-42', sub: 'subject-1' })).toBe('e-42');
    expect(getExternalId(sso, { sub: 'subject-1' })).toBeUndefined();
  });

  it('ignores empty and non-string claim values', async () => {
    const sso = await ssoConfig({ SSO_CLAIM_EXTERNAL_ID: 'employee_id' });

    expect(getExternalId(sso, { employee_id: '' })).toBeUndefined();
    expect(getExternalId(sso, { employee_id: 42 })).toBeUndefined();
  });
});

describe('getSignInRestriction', () => {
  it('allows everyone when no restriction is configured', async () => {
    expect(getSignInRestriction(await ssoConfig(), 'ada@anywhere.com', {})).toBeUndefined();
  });

  it('allows email addresses in an allowed domain, ignoring case', async () => {
    const sso = await ssoConfig({ SSO_ALLOWED_EMAIL_DOMAINS: 'example.com' });

    expect(getSignInRestriction(sso, 'Ada@Example.COM', {})).toBeUndefined();
  });

  it.each(['ada@other.com', 'ada@sub.example.com', 'not-an-email'])(
    'rejects %s outside the allowed domains',
    async (email) => {
      const sso = await ssoConfig({ SSO_ALLOWED_EMAIL_DOMAINS: 'example.com' });

      expect(getSignInRestriction(sso, email, {})).toEqual({
        code: 'sso_email_domain_not_allowed',
        message: 'Sign-in is limited to example.com email addresses.',
      });
    },
  );

  it('allows a claim holding one of the allowed values, including in an array', async () => {
    const sso = await ssoConfig({ SSO_ALLOWED_CLAIM: 'tid', SSO_ALLOWED_CLAIM_VALUES: 'tenant-a,tenant-b' });

    expect(getSignInRestriction(sso, 'ada@example.com', { tid: 'tenant-b' })).toBeUndefined();
    expect(getSignInRestriction(sso, 'ada@example.com', { tid: ['tenant-x', 'tenant-a'] })).toBeUndefined();
  });

  it.each([{ tid: 'tenant-x' }, {}])('rejects claims %o without an allowed value', async (claims) => {
    const sso = await ssoConfig({ SSO_ALLOWED_CLAIM: 'tid', SSO_ALLOWED_CLAIM_VALUES: 'tenant-a' });

    expect(getSignInRestriction(sso, 'ada@example.com', claims)).toEqual({
      code: 'sso_claim_not_allowed',
      message: "Your account's tid is not allowed to sign in.",
    });
  });
});

describe('createResolveSsoUser', () => {
  it('links the user with the same external id and refreshes the profile', async () => {
    const resolveUser = createResolveSsoUser(await ssoConfig());
    const { context, findOne } = databaseWith({ id: 'user-1' });

    expect(await resolveUser(resolveInput({ oid: 'object-1', sub: 'subject-1' }, 'new@example.com'), context)).toEqual({
      action: 'link',
      userId: 'user-1',
      profile: 'update',
    });
    expect(findOne).toHaveBeenCalledExactlyOnceWith({
      model: 'user',
      where: [{ field: 'externalId', value: 'object-1' }],
    });
  });

  it('keeps the stored profile when IDENTITY_PROFILE_SYNC is false', async () => {
    const resolveUser = createResolveSsoUser(await ssoConfig({ IDENTITY_PROFILE_SYNC: 'false' }));

    expect(await resolveUser(resolveInput({ sub: 'subject-1' }), databaseWith({ id: 'user-1' }).context)).toMatchObject(
      {
        profile: 'preserve',
      },
    );
  });

  it('lets Better Auth create the user when no one has the external id', async () => {
    const resolveUser = createResolveSsoUser(await ssoConfig());

    expect(await resolveUser(resolveInput({ sub: 'subject-1' }), databaseWith().context)).toEqual({
      action: 'continue',
    });
  });

  it('rejects a sign-in outside the allowed domains before looking anyone up', async () => {
    const resolveUser = createResolveSsoUser(await ssoConfig({ SSO_ALLOWED_EMAIL_DOMAINS: 'other.com' }));
    const { context, findOne } = databaseWith({ id: 'user-1' });

    expect(await resolveUser(resolveInput({ sub: 'subject-1' }), context)).toMatchObject({
      action: 'reject',
      code: 'sso_email_domain_not_allowed',
    });
    expect(findOne).not.toHaveBeenCalled();
  });

  it('rejects a sign-in without the configured external id claim', async () => {
    const resolveUser = createResolveSsoUser(await ssoConfig({ SSO_CLAIM_EXTERNAL_ID: 'employee_id' }));

    expect(await resolveUser(resolveInput({ sub: 'subject-1' }), databaseWith().context)).toEqual({
      action: 'reject',
      code: 'sso_external_id_missing',
      message: 'The identity provider did not send the employee_id claim.',
    });
  });

  it('rejects SAML sign-ins', async () => {
    const resolveUser = createResolveSsoUser(await ssoConfig());
    const input = { protocol: 'saml' } as unknown as ResolveInput;

    expect(await resolveUser(input, databaseWith().context)).toEqual({
      action: 'reject',
      code: 'sso_protocol_not_supported',
    });
  });
});

describe('createProvisionSsoUser', () => {
  function provisionInput(user: Record<string, unknown>, claims?: Record<string, unknown>) {
    return { user, token: claims ? { idToken: idToken(claims) } : undefined } as unknown as ProvisionInput;
  }

  it('stores the external id from the ID token on a user without one', async () => {
    const setExternalId = vi.fn();
    const provisionUser = createProvisionSsoUser(await ssoConfig(), setExternalId);

    await provisionUser(provisionInput({ id: 'user-1', externalId: null }, { oid: 'object-1', sub: 'subject-1' }));

    expect(setExternalId).toHaveBeenCalledExactlyOnceWith('user-1', 'object-1');
  });

  it('leaves a stored external id alone', async () => {
    const setExternalId = vi.fn();
    const provisionUser = createProvisionSsoUser(await ssoConfig(), setExternalId);

    await provisionUser(provisionInput({ id: 'user-1', externalId: 'object-1' }, { oid: 'object-2' }));

    expect(setExternalId).not.toHaveBeenCalled();
  });

  it('does nothing without an ID token', async () => {
    const setExternalId = vi.fn();
    const provisionUser = createProvisionSsoUser(await ssoConfig(), setExternalId);

    await provisionUser(provisionInput({ id: 'user-1' }));

    expect(setExternalId).not.toHaveBeenCalled();
  });
});
