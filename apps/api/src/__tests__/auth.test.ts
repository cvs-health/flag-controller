// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { organization } from 'better-auth/plugins';
import { ActionType, SubjectType, TeamCreateErrorCode } from 'shared-types';

import { SYSTEM } from '../constants/common.js';
import { afterCreateTeam, auth, beforeCreateTeam, organizationRoles } from '../auth.js';
import type { createIdentityHooks } from '../utils/identityHooks.js';
import { mockRepositories } from 'test/testUtils.js';

const mocks = vi.hoisted(() => ({
  betterAuth: vi.fn(),
  drizzle: vi.fn(),
  getBySlug: vi.fn(),
  getTeamByName: vi.fn(),
  addMembers: vi.fn(),
  identityHooks: undefined as ReturnType<typeof createIdentityHooks> | undefined,
}));

vi.mock('../utils/identityHooks.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/identityHooks.js')>();

  return {
    createIdentityHooks: (...args: Parameters<typeof actual.createIdentityHooks>) => {
      mocks.identityHooks = actual.createIdentityHooks(...args);
      return mocks.identityHooks;
    },
  };
});

// auth.ts builds the plugin once on load, and the clearAllMocks calls below would drop this call.
const organizationOptions = vi.mocked(organization).mock.calls[0]?.[0];

vi.mock('../utils/createRepositories.js', () => ({
  default: vi.fn(() => ({
    teamsRepository: mockRepositories.teamsRepository,
    logsRepository: mockRepositories.logsRepository,
  })),
}));

vi.mock('../services/organizationsService.js', () => ({
  default: vi.fn(() => ({
    getBySlug: mocks.getBySlug,
  })),
}));

vi.mock('../services/teamsService.js', () => ({
  default: vi.fn(() => ({
    getTeamByName: mocks.getTeamByName,
    addMembers: mocks.addMembers,
  })),
}));

describe('auth database hooks', () => {
  const hooks = auth.options.databaseHooks;
  const session = {
    id: 'session-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user-1',
    activeOrganizationId: null,
    expiresAt: new Date(),
    token: '',
  };
  const organization = {
    createdAt: new Date(),
    id: 'org-1',
    name: 'default',
    slug: 'default',
  };
  const team = {
    id: 'team-1',
    organizationId: 'org-1',
    name: 'my-team',
  };
  const user = {
    createdAt: new Date(),
    email: 'user@example.com',
    emailVerified: false,
    id: 'user-1',
    name: 'User',
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('session create before hook', () => {
    it('sets the default organization as the active organization', async () => {
      mocks.getBySlug.mockResolvedValue({ id: 'org-1' });

      const result = await hooks.session.create.before(session);

      expect(result).toEqual({ data: { ...session, activeOrganizationId: 'org-1' } });
    });

    it('leaves the active organization unset when the default organization is missing', async () => {
      const updatedSession = { ...session, activeOrganizationId: 'existing-org' };
      mocks.getBySlug.mockResolvedValue(null);

      const result = await hooks.session.create.before(updatedSession);

      expect(result).toEqual({ data: { ...updatedSession, activeOrganizationId: null } });
    });
  });

  describe('session create after hook', () => {
    function hookContext(organization: { id: string } | null) {
      return {
        context: {
          adapter: { findOne: vi.fn().mockResolvedValue(organization) },
          internalAdapter: { updateSession: vi.fn() },
        },
      };
    }

    it("sets the default organization on the first user's session once it exists", async () => {
      const ctx = hookContext({ id: 'org-1' });

      await hooks.session.create.after({ ...session, token: 'token-1' }, ctx as never);

      expect(ctx.context.internalAdapter.updateSession).toHaveBeenCalledExactlyOnceWith('token-1', {
        activeOrganizationId: 'org-1',
      });
    });

    it('leaves a session that already has an active organization alone', async () => {
      const ctx = hookContext({ id: 'org-1' });

      await hooks.session.create.after({ ...session, activeOrganizationId: 'org-1' }, ctx as never);

      expect(ctx.context.adapter.findOne).not.toHaveBeenCalled();
      expect(ctx.context.internalAdapter.updateSession).not.toHaveBeenCalled();
    });
  });

  describe('user create after hook', () => {
    it('adds the user to the default organization when it exists', async () => {
      mocks.getBySlug.mockResolvedValue({ id: 'org-1' });
      mocks.getTeamByName.mockResolvedValue({ id: 'team-1' });

      await hooks.user.create.after(user);

      expect(auth.api.addMember).toHaveBeenCalledExactlyOnceWith({
        body: {
          organizationId: 'org-1',
          role: 'member',
          userId: user.id,
        },
      });
      expect(auth.api.createOrganization).not.toHaveBeenCalled();
    });

    it('adds the user to the default team when the organization and team exist', async () => {
      mocks.getBySlug.mockResolvedValue({ id: 'org-1' });
      mocks.getTeamByName.mockResolvedValue({ id: 'team-1' });

      await hooks.user.create.after(user);

      expect(mocks.getTeamByName).toHaveBeenCalledExactlyOnceWith('default');
      expect(mocks.addMembers).toHaveBeenCalledExactlyOnceWith('team-1', [user.id], user.id);
    });

    it('creates the default organization when it is missing', async () => {
      mocks.getBySlug.mockResolvedValue(null);

      await hooks.user.create.after(user);

      expect(auth.api.createOrganization).toHaveBeenCalledExactlyOnceWith({
        body: {
          name: 'default',
          slug: 'default',
          userId: user.id,
        },
      });
      expect(auth.api.addMember).not.toHaveBeenCalled();
      expect(mocks.getTeamByName).not.toHaveBeenCalled();
      expect(mocks.addMembers).not.toHaveBeenCalled();
    });
  });

  describe('beforeCreateTeam organization hook', () => {
    it('normalizes the team name into lowercase, kebab-case', async () => {
      const result = await beforeCreateTeam({
        team: { name: 'My Team', organizationId: organization.id },
        organization,
      });

      expect(result).toEqual({ data: { name: team.name, organizationId: organization.id } });
    });

    it('leaves an already normalized team name unchanged', async () => {
      const result = await beforeCreateTeam({
        team: { name: team.name, organizationId: organization.id },
        organization,
      });

      expect(result).toEqual({ data: { name: team.name, organizationId: organization.id } });
    });

    it('checks for an existing team using the normalized name', async () => {
      await beforeCreateTeam({
        team: { name: 'My Team', organizationId: organization.id },
        organization,
      });

      expect(mockRepositories.teamsRepository.findByName).toHaveBeenCalledExactlyOnceWith(organization.id, team.name);
    });

    it('rejects a team name that is already in use', async () => {
      mockRepositories.teamsRepository.findByName.mockResolvedValueOnce({
        ...team,
        createdAt: new Date(),
        deletedAt: null,
        memberCount: 0,
        updatedAt: null,
      });

      await expect(
        beforeCreateTeam({ team: { name: team.name, organizationId: organization.id }, organization }),
      ).rejects.toMatchObject({
        status: 'CONFLICT',
        body: { code: TeamCreateErrorCode.AlreadyExists, message: 'Team already exists' },
      });
    });
  });

  describe('afterCreateTeam organization hook', () => {
    it('adds the creator as the first member so the team is theirs to administer', async () => {
      await afterCreateTeam({ team: { ...team, createdAt: new Date() }, user, organization });

      expect(mockRepositories.teamsRepository.addMember).toHaveBeenCalledExactlyOnceWith('team-1', 'user-1');
      expect(mockRepositories.logsRepository.create).toHaveBeenCalledExactlyOnceWith({
        action: ActionType.Create,
        actorId: user.id,
        applicationId: null,
        newData: {
          name: team.name,
        },
        oldData: null,
        subjectId: team.id,
        subjectKey: team.name,
        subjectType: SubjectType.Team,
      });
    });

    it('does nothing when there is no creator to attribute the team to', async () => {
      await afterCreateTeam({ team: { ...team, createdAt: new Date() }, organization });

      expect(mockRepositories.teamsRepository.addMember).not.toHaveBeenCalled();
      expect(mockRepositories.logsRepository.create).toHaveBeenCalledExactlyOnceWith({
        action: ActionType.Create,
        actorId: SYSTEM,
        applicationId: null,
        newData: {
          name: team.name,
        },
        oldData: null,
        subjectId: team.id,
        subjectKey: team.name,
        subjectType: SubjectType.Team,
      });
    });
  });
});

describe('identity hooks on the organization plugin', () => {
  function identityHooks() {
    if (!mocks.identityHooks) {
      throw new Error('auth.ts did not create the identity hooks');
    }
    return mocks.identityHooks;
  }

  it('passes every identity hook to the plugin', () => {
    // beforeCreateTeam is wrapped, so the next test checks it by calling it.
    const { beforeCreateTeam: _wrapped, ...hooks } = identityHooks().organizationHooks;

    expect(organizationOptions?.organizationHooks).toMatchObject(hooks);
  });

  it('runs the identity check when Better Auth creates a team', async () => {
    const check = vi.spyOn(identityHooks().organizationHooks, 'beforeCreateTeam');
    const organization = { createdAt: new Date(), id: 'org-1', name: 'default', slug: 'default' };

    await organizationOptions?.organizationHooks?.beforeCreateTeam?.({
      team: { name: 'payments-platform', organizationId: organization.id },
      organization,
    });

    expect(check).toHaveBeenCalledOnce();
  });
});

describe('organizationRoles', () => {
  it('denies members every better-auth membership mutation so team membership only changes via /teams', () => {
    const { member } = organizationRoles;

    expect(member.authorize({ team: ['create'] }).success).toBe(true);
    expect(member.authorize({ team: ['update'] }).success).toBe(false);
    expect(member.authorize({ team: ['delete'] }).success).toBe(false);
    expect(member.authorize({ member: ['create'] }).success).toBe(false);
    expect(member.authorize({ member: ['update'] }).success).toBe(false);
    expect(member.authorize({ member: ['delete'] }).success).toBe(false);
  });
});
