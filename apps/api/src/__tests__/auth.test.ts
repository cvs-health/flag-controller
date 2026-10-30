// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionType, SubjectType } from 'shared-types';

import { SYSTEM } from '../constants/common.js';
import { afterCreateTeam, auth, beforeCreateTeam, organizationRoles } from '../auth.js';
import { mockRepositories } from 'test/testUtils.js';

const mocks = vi.hoisted(() => ({
  betterAuth: vi.fn(),
  drizzle: vi.fn(),
  getBySlug: vi.fn(),
  getTeamByName: vi.fn(),
  addMembers: vi.fn(),
}));

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
