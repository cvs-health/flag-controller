// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { IdentityModes } from 'shared-types';

import { IdentityManagedError } from '../errors/AppError.js';

type Entity = 'teams' | 'memberships' | 'applications';

const NOUNS: Record<Entity, string> = {
  teams: 'Teams',
  memberships: 'Team memberships',
  applications: 'Applications',
};

export type IdentityPolicy = ReturnType<typeof createIdentityPolicy>;

export function createIdentityPolicy(modes: IdentityModes) {
  return {
    /** With external users, only accounts the directory provisioned may sign in. */
    assertCanSignUp: () => {
      if (modes.users === 'external') {
        throw new IdentityManagedError({
          message: 'Cannot create a user on sign-in: IDENTITY_USERS_MODE is external',
          detail: 'Your account has not been provisioned by your identity provider.',
          context: { entity: 'users' },
        });
      }
    },

    /** Refuses any create, change or delete of an entity the identity provider owns. */
    assertLocallyManaged: (entity: Entity) => {
      if (modes[entity] === 'external') {
        throw new IdentityManagedError({
          message: `Cannot write ${entity}: IDENTITY_${entity.toUpperCase()}_MODE is external`,
          detail: `${NOUNS[entity]} are managed by your identity provider.`,
          context: { entity },
        });
      }
    },
  };
}
