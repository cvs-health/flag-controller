// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { SSOOptions } from '@better-auth/sso';

import type { getAuthConfig } from './getAuthConfig.js';

type SsoConfig = Extract<ReturnType<typeof getAuthConfig>, { sso: unknown }>['sso'];
type ResolveUser = NonNullable<SSOOptions['resolveUser']>;
type ProvisionUser = NonNullable<SSOOptions['provisionUser']>;

export function getExternalId(sso: SsoConfig, claims: Record<string, unknown>) {
  const value = claims[sso.externalIdClaim] ?? (sso.externalIdFallbackToSub ? claims.sub : undefined);

  return typeof value === 'string' && value ? value : undefined;
}

export function getSignInRestriction(sso: SsoConfig, email: string, claims: Record<string, unknown>) {
  if (sso.allowedEmailDomains) {
    const domain = email.split('@').at(-1)?.toLowerCase();

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

/** Matches users by the IdP's stable subject only, never by email. */
export function createResolveSsoUser(sso: SsoConfig): ResolveUser {
  return async (input, { database }) => {
    if (input.protocol !== 'oidc') {
      return { action: 'reject', code: 'sso_protocol_not_supported' };
    }

    const claims = input.verifiedIdTokenClaims;
    const restriction = getSignInRestriction(sso, input.providerUser.email, claims);
    if (restriction) {
      return { action: 'reject', ...restriction };
    }

    const externalId = getExternalId(sso, claims);
    if (!externalId) {
      return {
        action: 'reject',
        code: 'sso_external_id_missing',
        message: `The identity provider did not send the ${sso.externalIdClaim} claim.`,
      };
    }

    const user = await database.findOne<{ id: string }>({
      model: 'user',
      where: [{ field: 'externalId', value: externalId }],
    });

    // A new user is created by Better Auth, and provisionUser then stores its external id.
    if (!user) {
      return { action: 'continue' };
    }

    return { action: 'link', userId: user.id, profile: sso.profileSync ? 'update' : 'preserve' };
  };
}

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(jwt.split('.')[1] ?? '', 'base64url').toString());
}

/**
 * Stores the external id on users that don't have one yet. resolveUser can't set fields on a user
 * Better Auth is about to create, so this runs after the sign-in commits. The plugin verified the
 * ID token earlier in the same request.
 */
export function createProvisionSsoUser(
  sso: SsoConfig,
  setExternalId: (userId: string, externalId: string) => Promise<unknown>,
): ProvisionUser {
  return async ({ user, token }) => {
    if (user.externalId || !token?.idToken) {
      return;
    }

    const externalId = getExternalId(sso, decodeJwtPayload(token.idToken));
    if (externalId) {
      await setExternalId(user.id, externalId);
    }
  };
}
