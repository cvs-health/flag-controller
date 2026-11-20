// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import { issuer, loadSsoConfig } from 'test/sso.js';
import { initializeAuthConfig } from '../getAuthConfig.js';
import { createProvisionSsoUser, createResolveSsoUser, getExternalId, getSignInRestriction } from '../ssoUser.js';

type ResolveUser = ReturnType<typeof createResolveSsoUser>;
type ProvisionUser = ReturnType<typeof createProvisionSsoUser>;

const contosoTenantId = '4b1c6f0e-9d3a-4e7b-8a2c-1f5d9e0b7c34';

const entraClaims = {
  iss: `https://login.microsoftonline.com/${contosoTenantId}/v2.0`,
  aud: 'flag-controller',
  sub: 'AAAAAAAAAAAAAAAAAAAAAMv2Tq9f1sXn0gH3kL8pWzE',
  oid: '0e7a3f52-6c1d-4b9e-a4f8-2d5c7b9e1a03',
  tid: contosoTenantId,
  email: 'ada.lovelace@contoso.com',
  name: 'Ada Lovelace',
  roles: ['FlagController.Editor'],
};

const keycloakClaims = {
  iss: issuer,
  aud: 'flag-controller',
  azp: 'flag-controller',
  sub: '1408fe4f-d510-45ca-ae3f-e472b54062de',
  email: 'grace.hopper@example.com',
  name: 'Grace Hopper',
};

const existingUserId = 'bJB6nVXAOQeYlunWrVSOWuTAQFfdl6Ck';

function resolveInput(claims: Record<string, unknown>, userInfo = claims) {
  return {
    protocol: 'oidc',
    providerUser: { email: userInfo.email },
    providerClaims: userInfo,
    verifiedIdTokenClaims: claims,
  } as unknown as Parameters<ResolveUser>[0];
}

function databaseWith(user: { id: string } | null) {
  const findOne = vi.fn().mockResolvedValue(user);
  return { findOne, context: { database: { findOne } } as unknown as Parameters<ResolveUser>[1] };
}

function signedIdToken(claims: Record<string, unknown>) {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'RS256', kid: 'kRp5Qn2s' })}.${encode(claims)}.c2lnbmF0dXJl`;
}

afterEach(async () => {
  vi.unstubAllEnvs();
  await initializeAuthConfig();
});

describe('getExternalId', () => {
  it("uses Entra ID's oid rather than its per-app sub", async () => {
    expect(getExternalId(await loadSsoConfig(), entraClaims)).toBe(entraClaims.oid);
  });

  it('falls back to sub for IdPs that send no oid', async () => {
    expect(getExternalId(await loadSsoConfig(), keycloakClaims)).toBe(keycloakClaims.sub);
  });

  it('uses a configured claim and never falls back to sub', async () => {
    const sso = await loadSsoConfig({ SSO_CLAIM_EXTERNAL_ID: 'employee_id' });

    expect(getExternalId(sso, { ...keycloakClaims, employee_id: 'E104729' })).toBe('E104729');
    expect(getExternalId(sso, keycloakClaims)).toBeUndefined();
  });

  it('ignores a claim that is not a string', async () => {
    const sso = await loadSsoConfig({ SSO_CLAIM_EXTERNAL_ID: 'employee_id' });

    expect(getExternalId(sso, { ...keycloakClaims, employee_id: 104729 })).toBeUndefined();
  });
});

describe('getSignInRestriction', () => {
  it('allows everyone when no restriction is configured', async () => {
    expect(getSignInRestriction(await loadSsoConfig(), keycloakClaims, keycloakClaims)).toBeUndefined();
  });

  it('allows an email in an allowed domain, ignoring case', async () => {
    const sso = await loadSsoConfig({ SSO_ALLOWED_EMAIL_DOMAINS: 'contoso.com' });

    expect(getSignInRestriction(sso, { email: 'Ada.Lovelace@Contoso.COM' }, entraClaims)).toBeUndefined();
  });

  it.each(['grace.hopper@example.com', 'ada@eu.contoso.com', 'contoso.com'])(
    'rejects %s outside the allowed domains',
    async (email) => {
      const sso = await loadSsoConfig({ SSO_ALLOWED_EMAIL_DOMAINS: 'contoso.com' });

      expect(getSignInRestriction(sso, { email }, keycloakClaims)).toEqual({
        code: 'sso_email_domain_not_allowed',
        message: 'Sign-in is limited to contoso.com email addresses.',
      });
    },
  );

  it('allows an Entra ID tenant on the list', async () => {
    const sso = await loadSsoConfig({ SSO_ALLOWED_CLAIM: 'tid', SSO_ALLOWED_CLAIM_VALUES: contosoTenantId });

    expect(getSignInRestriction(sso, entraClaims, entraClaims)).toBeUndefined();
  });

  it('allows a multi-valued claim when any value is on the list', async () => {
    const sso = await loadSsoConfig({ SSO_ALLOWED_CLAIM: 'roles', SSO_ALLOWED_CLAIM_VALUES: 'FlagController.Editor' });

    expect(getSignInRestriction(sso, entraClaims, entraClaims)).toBeUndefined();
  });

  it.each([
    ['another tenant', { ...entraClaims, tid: '9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d' }],
    ['no tenant claim', keycloakClaims],
  ])('rejects %s', async (_, claims) => {
    const sso = await loadSsoConfig({ SSO_ALLOWED_CLAIM: 'tid', SSO_ALLOWED_CLAIM_VALUES: contosoTenantId });

    expect(getSignInRestriction(sso, claims, claims)).toEqual({
      code: 'sso_claim_not_allowed',
      message: "Your account's tid is not allowed to sign in.",
    });
  });
});

describe('createResolveSsoUser', () => {
  it('signs in the user with the same external id, even after an email change, and refreshes the profile', async () => {
    const resolveUser = createResolveSsoUser(await loadSsoConfig());
    const { context, findOne } = databaseWith({ id: existingUserId });

    const decision = await resolveUser(resolveInput({ ...entraClaims, email: 'ada.king@contoso.com' }), context);

    expect(decision).toEqual({ action: 'link', userId: existingUserId, profile: 'update' });
    expect(findOne).toHaveBeenCalledExactlyOnceWith({
      model: 'user',
      where: [{ field: 'externalId', value: entraClaims.oid }],
    });
  });

  it('lets Better Auth create the user on a first sign-in', async () => {
    const resolveUser = createResolveSsoUser(await loadSsoConfig());

    expect(await resolveUser(resolveInput(keycloakClaims), databaseWith(null).context)).toEqual({
      action: 'continue',
    });
  });

  it('rejects a sign-in outside the allowed domains before looking anyone up', async () => {
    const resolveUser = createResolveSsoUser(await loadSsoConfig({ SSO_ALLOWED_EMAIL_DOMAINS: 'contoso.com' }));
    const { context, findOne } = databaseWith({ id: existingUserId });

    expect(await resolveUser(resolveInput(keycloakClaims), context)).toEqual({
      action: 'reject',
      code: 'sso_email_domain_not_allowed',
      message: 'Sign-in is limited to contoso.com email addresses.',
    });
    expect(findOne).not.toHaveBeenCalled();
  });

  it('rejects an email that userinfo marks as unverified, even when the ID token omits the flag', async () => {
    const resolveUser = createResolveSsoUser(await loadSsoConfig({ SSO_ALLOWED_EMAIL_DOMAINS: 'example.com' }));
    const userInfo = { ...keycloakClaims, email_verified: false };

    expect(await resolveUser(resolveInput(keycloakClaims, userInfo), databaseWith(null).context)).toEqual({
      action: 'reject',
      code: 'sso_email_not_verified',
      message: 'Verify your email address with your identity provider.',
    });
  });

  it('rejects a sign-in without the configured external id claim', async () => {
    const resolveUser = createResolveSsoUser(await loadSsoConfig({ SSO_CLAIM_EXTERNAL_ID: 'employee_id' }));

    expect(await resolveUser(resolveInput(keycloakClaims), databaseWith(null).context)).toEqual({
      action: 'reject',
      code: 'sso_external_id_missing',
      message: 'The identity provider did not send the employee_id claim.',
    });
  });
});

describe('createProvisionSsoUser', () => {
  function provisionInput(user: { id: string; externalId?: string | null }, idToken?: string) {
    return { user, token: idToken ? { idToken } : undefined } as unknown as Parameters<ProvisionUser>[0];
  }

  it('stores the external id from the ID token on a new user', async () => {
    const setExternalId = vi.fn();
    const provisionUser = createProvisionSsoUser(await loadSsoConfig(), setExternalId);

    await provisionUser(provisionInput({ id: existingUserId, externalId: null }, signedIdToken(entraClaims)));

    expect(setExternalId).toHaveBeenCalledExactlyOnceWith(existingUserId, entraClaims.oid);
  });

  it('leaves an external id that is already stored', async () => {
    const setExternalId = vi.fn();
    const provisionUser = createProvisionSsoUser(await loadSsoConfig(), setExternalId);

    await provisionUser(
      provisionInput({ id: existingUserId, externalId: entraClaims.oid }, signedIdToken(entraClaims)),
    );

    expect(setExternalId).not.toHaveBeenCalled();
  });

  it('does nothing without an ID token', async () => {
    const setExternalId = vi.fn();
    const provisionUser = createProvisionSsoUser(await loadSsoConfig(), setExternalId);

    await provisionUser(provisionInput({ id: existingUserId, externalId: null }));

    expect(setExternalId).not.toHaveBeenCalled();
  });
});
