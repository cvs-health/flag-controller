// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { SSOOptions } from '@better-auth/sso';

import type { SsoConfig } from './getAuthConfig.js';

export function getExternalId(sso: SsoConfig, claims: Record<string, unknown>) {
  const value = sso.externalIdClaims.map((claim) => claims[claim]).find(Boolean);

  return typeof value === 'string' ? value : undefined;
}

/** `profile` is where the email came from (userinfo, or the ID token); `claims` is the verified ID token. */
export function getSignInRestriction(
  sso: SsoConfig,
  profile: { email: string; email_verified?: unknown },
  claims: Record<string, unknown>,
) {
  if (sso.allowedEmailDomains) {
    // Entra ID omits email_verified, so only an explicit false is rejected.
    if (profile.email_verified === false) {
      return { code: 'sso_email_not_verified', message: 'Verify your email address with your identity provider.' };
    }

    const domain = /@([^@]+)$/.exec(profile.email)?.[1].toLowerCase();

    if (!domain || !sso.allowedEmailDomains.includes(domain)) {
      return {
        code: 'sso_email_domain_not_allowed',
        message: `Sign-in is limited to ${sso.allowedEmailDomains.join(', ')} email addresses.`,
      };
    }
  }

  if (sso.allowedClaim) {
    const { name, values } = sso.allowedClaim;
    const claimValues = [claims[name]].flat().filter((value) => typeof value === 'string');

    if (!claimValues.some((value) => values.includes(value))) {
      return { code: 'sso_claim_not_allowed', message: `Your account's ${name} is not allowed to sign in.` };
    }
  }
}

/** Finds users by the IdP subject only, never by email. */
export function createResolveSsoUser(sso: SsoConfig) {
  return (async (input, { database }) => {
    if (input.protocol !== 'oidc') {
      return { action: 'reject', code: 'sso_protocol_not_supported' };
    }

    const claims = input.verifiedIdTokenClaims;
    const restriction = getSignInRestriction(sso, { ...input.providerClaims, email: input.providerUser.email }, claims);
    if (restriction) {
      return { action: 'reject', ...restriction };
    }

    const externalId = getExternalId(sso, claims);
    if (!externalId) {
      return {
        action: 'reject',
        code: 'sso_external_id_missing',
        message: `The identity provider did not send the ${sso.externalIdClaims[0]} claim.`,
      };
    }

    const user = await database.findOne<{ id: string }>({
      model: 'user',
      where: [{ field: 'externalId', value: externalId }],
    });

    // No match: Better Auth creates the user and provisionUser stores the external id.
    return user ? { action: 'link', userId: user.id, profile: 'update' } : { action: 'continue' };
  }) satisfies NonNullable<SSOOptions['resolveUser']>;
}

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(jwt.split('.')[1] ?? '', 'base64url').toString());
}

/** Stores the external id after sign-in, because resolveUser can't set fields on a user Better Auth creates. */
export function createProvisionSsoUser(
  sso: SsoConfig,
  setExternalId: (userId: string, externalId: string) => Promise<unknown>,
) {
  return (async ({ user, token }) => {
    if (user.externalId || !token?.idToken) {
      return;
    }

    // The plugin verified this ID token earlier in the same request.
    const externalId = getExternalId(sso, decodeJwtPayload(token.idToken));
    if (externalId) {
      await setExternalId(user.id, externalId);
    }
  }) satisfies NonNullable<SSOOptions['provisionUser']>;
}
