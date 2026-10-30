// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, eq, inArray, isNull } from 'drizzle-orm';
import { afterEach, describe, expect, it, vi } from 'vitest';

import createTeamsRepository from 'repositories/teamsRepository.js';
import mockDb from 'test/mockDb.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { teamMembers, teams } from 'db/schema/auth.js';
import { NotFoundError } from '../../errors/AppError.js';

describe('teamsRepository', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAccessScope', () => {
    it('returns the distinct team ids the user belongs to', async () => {
      const [db, methods] = mockDb();
      const teamsRepository = createTeamsRepository(db);
      methods.where.mockResolvedValue([{ teamId: 'team-1' }, { teamId: 'team-1' }, { teamId: 'team-2' }]);

      const result = await teamsRepository.getAccessScope('user-1');

      expect(result).toEqual({ teamIds: ['team-1', 'team-2'] });
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(teamMembers.userId, 'user-1'));
    });

    it('returns an empty scope when the user has no memberships', async () => {
      const [db, methods] = mockDb();
      const teamsRepository = createTeamsRepository(db);
      methods.where.mockResolvedValue([]);

      const result = await teamsRepository.getAccessScope('user-1');

      expect(result).toEqual({ teamIds: [] });
    });
  });

  describe('list', () => {
    it('applies pagination params', async () => {
      const [db, methods] = mockDb();
      const teamsRepository = createTeamsRepository(db);
      const params = { pagination: { limit: 10, offset: 10 } };

      await teamsRepository.list(params);

      expect(methods.limit).toHaveBeenCalledWith(params.pagination.limit);
      expect(methods.offset).toHaveBeenCalledWith(params.pagination.offset);
    });

    it('skips limit and offset when PAGINATION_NO_LIMIT', async () => {
      const [db, methods] = mockDb();
      const teamsRepository = createTeamsRepository(db);

      await teamsRepository.list({ pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 } });

      expect(methods.limit).not.toHaveBeenCalled();
      expect(methods.offset).not.toHaveBeenCalled();
    });

    it('applies filters', async () => {
      const [db, methods] = mockDb();
      const teamsRepository = createTeamsRepository(db);
      const applicationIds = ['team-1', 'team-2'];

      await teamsRepository.list({
        filters: { applicationIds, include: { deleted: true } },
        pagination: { limit: 10, offset: 0 },
      });
      expect(methods.where).toHaveBeenCalledWith(and(inArray(teams.id, applicationIds)));

      await teamsRepository.list({ filters: { applicationIds }, pagination: { limit: 10, offset: 0 } });
      expect(methods.where).toHaveBeenCalledWith(and(isNull(teams.deletedAt), inArray(teams.id, applicationIds)));

      await teamsRepository.list({ filters: { organizationId: 'org-1' }, pagination: { limit: 10, offset: 0 } });
      expect(methods.where).toHaveBeenCalledWith(and(isNull(teams.deletedAt), eq(teams.organizationId, 'org-1')));
    });
  });

  describe('count', () => {
    it('applies filters', async () => {
      const [db, methods] = mockDb();
      const teamsRepository = createTeamsRepository(db);
      const applicationIds = ['team-1', 'team-2'];

      await teamsRepository.count({ filters: { organizationId: 'org-1' } });

      expect(methods.where).toHaveBeenCalledWith(and(isNull(teams.deletedAt), eq(teams.organizationId, 'org-1')));

      await teamsRepository.count({ filters: { applicationIds } });

      expect(methods.where).toHaveBeenCalledWith(and(isNull(teams.deletedAt), inArray(teams.id, applicationIds)));

      await teamsRepository.count({ filters: { organizationId: 'org-1', userId: 'user-1' } });

      expect(methods.innerJoin).toHaveBeenCalledWith(teamMembers, eq(teams.id, teamMembers.teamId));
      expect(methods.where).toHaveBeenCalledWith(
        and(isNull(teams.deletedAt), eq(teams.organizationId, 'org-1'), eq(teamMembers.userId, 'user-1')),
      );
    });
  });

  describe('findById', () => {
    it('finds by id', async () => {
      const teamId = 'team-1';
      const [db, methods] = mockDb();
      const teamsRepository = createTeamsRepository(db);

      await teamsRepository.findById(teamId);

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(teams.id, teamId));
    });
  });

  describe('getByName', () => {
    it('gets by name', async () => {
      const team = { id: 'id', name: 'team-1' };
      const [db, methods] = mockDb();
      const teamsRepository = createTeamsRepository(db);

      methods.limit.mockResolvedValueOnce([team]);

      await teamsRepository.getByName(team.name);

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(teams.name, team.name));
    });

    it('throws when team is not found', async () => {
      const teamName = 'team-1';
      const [db, methods] = mockDb();
      const teamsRepository = createTeamsRepository(db);

      methods.limit.mockResolvedValueOnce([]);

      await expect(teamsRepository.getByName(teamName)).rejects.toThrow(NotFoundError);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(teams.name, teamName));
    });
  });

  describe('hardDeleteById', () => {
    it('hard-deletes by id', async () => {
      const teamId = 'team-1';
      const [db, methods] = mockDb();
      const teamsRepository = createTeamsRepository(db);

      await teamsRepository.hardDeleteById(teamId);

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(teams.id, teamId));
    });
  });

  describe('addMember', () => {
    it('returns the existing row without inserting when the user is already a member', async () => {
      const existing = {
        id: 'tm-1',
        teamId: 'team-1',
        userId: 'user-1',
        membershipKey: null,
        createdAt: new Date(),
      };
      const [db, methods] = mockDb();
      const teamsRepository = createTeamsRepository(db);
      methods.limit.mockResolvedValue([existing]);

      const result = await teamsRepository.addMember('team-1', 'user-1');

      expect(result).toEqual(existing);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(eq(teamMembers.teamId, 'team-1'), eq(teamMembers.userId, 'user-1')),
      );
      expect(methods.insert).not.toHaveBeenCalled();
    });

    it('inserts a membership row when the user is not yet a member', async () => {
      const inserted = {
        id: 'tm-1',
        teamId: 'team-1',
        userId: 'user-1',
        membershipKey: null,
        createdAt: new Date(),
      };
      const [db, methods] = mockDb();
      const teamsRepository = createTeamsRepository(db);
      methods.limit.mockResolvedValue([]);
      methods.returning.mockResolvedValue([inserted]);

      const result = await teamsRepository.addMember('team-1', 'user-1');

      expect(result).toEqual(inserted);
      expect(methods.insert).toHaveBeenCalledExactlyOnceWith(teamMembers);
      expect(methods.values).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ teamId: 'team-1', userId: 'user-1' }),
      );
    });
  });

  describe('removeMember', () => {
    it('deletes the membership row for the team and user', async () => {
      const [db, methods] = mockDb();
      const teamsRepository = createTeamsRepository(db);
      methods.returning.mockResolvedValue([]);

      const result = await teamsRepository.removeMember('team-1', 'user-1');

      expect(result).toBeNull();
      expect(methods.delete).toHaveBeenCalledExactlyOnceWith(teamMembers);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(eq(teamMembers.teamId, 'team-1'), eq(teamMembers.userId, 'user-1')),
      );
    });
  });
});
