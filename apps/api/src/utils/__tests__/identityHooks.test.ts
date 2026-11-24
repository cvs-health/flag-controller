// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { IdentityModes } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { createIdentityPolicy } from 'services/identityPolicy.js';
import { localIdentityModes } from 'test/testUtils.js';
import { createIdentityHooks } from '../identityHooks.js';

function hooksFor(modes: Partial<IdentityModes>) {
  return createIdentityHooks(createIdentityPolicy({ ...localIdentityModes, ...modes }));
}

function refusedWith(message: string) {
  return { statusCode: 403, body: expect.objectContaining({ code: 'IDENTITY_MANAGED', message }) };
}

describe('createIdentityHooks', () => {
  describe('beforeCreateUser', () => {
    it('lets sign-in create an account when IDENTITY_USERS_MODE=local', async () => {
      await expect(hooksFor({}).beforeCreateUser()).resolves.toBeUndefined();
    });

    it('refuses an account the directory did not provision when IDENTITY_USERS_MODE=external', async () => {
      await expect(hooksFor({ users: 'external' }).beforeCreateUser()).rejects.toMatchObject(
        refusedWith('Your account has not been provisioned by your identity provider.'),
      );
    });
  });

  describe.each(['beforeCreateTeam', 'beforeUpdateTeam', 'beforeDeleteTeam', 'beforeDeleteOrganization'] as const)(
    '%s',
    (hook) => {
      it('allows the write when IDENTITY_TEAMS_MODE=local', async () => {
        await expect(hooksFor({ teams: 'local' }).organizationHooks[hook]()).resolves.toBeUndefined();
      });

      it('refuses when IDENTITY_TEAMS_MODE=external', async () => {
        await expect(hooksFor({ teams: 'external' }).organizationHooks[hook]()).rejects.toMatchObject(
          refusedWith('Teams are managed by your identity provider.'),
        );
      });
    },
  );

  describe.each([
    'beforeAddTeamMember',
    'beforeRemoveTeamMember',
    'beforeRemoveMember',
    'beforeCreateInvitation',
  ] as const)('%s', (hook) => {
    it('allows the write when IDENTITY_TEAMS_MODE=local', async () => {
      const hooks = hooksFor({ teams: 'local' });

      await expect(hooks.organizationHooks[hook]()).resolves.toBeUndefined();
    });

    it('refuses when IDENTITY_TEAMS_MODE=external', async () => {
      const hooks = hooksFor({ teams: 'external' });

      await expect(hooks.organizationHooks[hook]()).rejects.toMatchObject(
        refusedWith('Team memberships are managed by your identity provider.'),
      );
    });
  });
});
