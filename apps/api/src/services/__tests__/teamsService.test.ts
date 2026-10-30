// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TeamDeleteErrorCode } from 'shared-types';

import type { TeamsService } from '../teamsService.js';
import { ForbiddenError, NotFoundError, UnprocessableError } from '../../errors/AppError.js';
import { ColumnSortingDirection } from '../../types/common.js';
import { createServiceWithMocks, mockAssertCanWrite, mockRepositories, notAMemberError } from 'test/testUtils.js';

describe('createTeamsService', () => {
  let service: TeamsService;

  const team = {
    createdAt: new Date(),
    deletedAt: null,
    id: 'team-1',
    memberCount: 0,
    name: 'my-team',
    organizationId: 'org-1',
    updatedAt: new Date(),
  };

  beforeEach(() => {
    service = createServiceWithMocks.teams;
  });

  describe('listMembers', () => {
    it('fetches members by team with pagination and sorting', async () => {
      const members = [
        {
          id: 'user-1',
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          emailVerified: true,
          image: null,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        },
      ];
      const filters = { teamIds: [team.id] };

      vi.mocked(mockRepositories.usersRepository.list).mockResolvedValue(members);
      vi.mocked(mockRepositories.usersRepository.count).mockResolvedValue(3);

      const result = await service.listMembers({
        filters,
        pagination: { page: 2, rows: 2 },
        sort: { field: 'name', direction: ColumnSortingDirection.ASC },
      });

      expect(mockRepositories.usersRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters,
        pagination: { limit: 2, offset: 2 },
        sort: { field: 'name', direction: ColumnSortingDirection.ASC },
      });
      expect(mockRepositories.usersRepository.count).toHaveBeenCalledExactlyOnceWith({ filters });
      expect(result).toEqual({
        data: members,
        metadata: {
          page: 2,
          records: 1,
          rows: 2,
          totalPages: 2,
          totalRecords: 3,
        },
      });
    });
  });

  describe('listTeams', () => {
    it('fetches based on available params', async () => {
      const application = {
        id: '456',
        name: 'my-application',
        teamId: team.id,
        teamName: 'my-team',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        deletedAt: null,
      };
      const teamsResult = [team];
      const applicationsResult = [application];
      const countResult = 1;

      vi.mocked(mockRepositories.teamsRepository.list).mockResolvedValue(teamsResult);
      vi.mocked(mockRepositories.applicationsRepository.list).mockResolvedValue(applicationsResult);
      vi.mocked(mockRepositories.teamsRepository.count).mockResolvedValue(countResult);

      const result = await service.listTeams({
        pagination: { page: 1, rows: 10 },
        with: { applications: true },
        sort: { field: 'updatedAt', direction: ColumnSortingDirection.ASC },
      });

      expect(result).toEqual({
        data: [{ ...team, applications: [application] }],
        metadata: {
          page: 1,
          records: 1,
          rows: 10,
          totalPages: 1,
          totalRecords: 1,
        },
      });
    });

    it('returns early if no teams', async () => {
      const countResult = 0;

      vi.mocked(mockRepositories.teamsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.teamsRepository.count).mockResolvedValue(countResult);

      const result = await service.listTeams({
        pagination: { page: 1, rows: 10 },
        with: { applications: true },
        sort: { field: 'updatedAt', direction: ColumnSortingDirection.ASC },
      });

      expect(result).toEqual({
        data: [],
        metadata: {
          page: 1,
          records: 0,
          rows: 10,
          totalPages: 0,
          totalRecords: 0,
        },
      });
    });

    it('returns teams with no applications', async () => {
      const teamsResult = [team];
      const countResult = 1;

      vi.mocked(mockRepositories.teamsRepository.list).mockResolvedValue(teamsResult);
      vi.mocked(mockRepositories.teamsRepository.count).mockResolvedValue(countResult);

      const result = await service.listTeams({
        pagination: { page: 1, rows: 10 },
        sort: { field: 'updatedAt', direction: ColumnSortingDirection.ASC },
      });

      expect(result).toEqual({
        data: teamsResult,
        metadata: {
          page: 1,
          records: 1,
          rows: 10,
          totalPages: 1,
          totalRecords: 1,
        },
      });
    });
  });

  describe('deleteTeam', () => {
    it('soft-deletes a team successfully', async () => {
      vi.mocked(mockRepositories.teamsRepository.findById).mockResolvedValue(team);
      vi.mocked(mockRepositories.applicationsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.teamsRepository.count).mockResolvedValue(2);
      vi.mocked(mockRepositories.teamsRepository.softDeleteById).mockResolvedValue({
        ...team,
        deletedAt: new Date('2026-05-06T00:00:00Z'),
      });

      await service.deleteTeam('team-1', 'user-1');

      expect(mockRepositories.teamsRepository.softDeleteById).toHaveBeenCalledWith('team-1');
      expect(mockRepositories.teamsRepository.count).toHaveBeenCalledWith({ filters: { organizationId: 'org-1' } });
    });

    it('hard-deletes a team when hard option is true', async () => {
      vi.mocked(mockRepositories.teamsRepository.findById).mockResolvedValue(team);
      vi.mocked(mockRepositories.applicationsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.teamsRepository.count).mockResolvedValue(2);
      vi.mocked(mockRepositories.teamsRepository.hardDeleteById).mockResolvedValue(team);

      await service.deleteTeam('team-1', 'user-1', true);

      expect(mockRepositories.teamsRepository.hardDeleteById).toHaveBeenCalledWith('team-1');
      expect(mockRepositories.teamsRepository.softDeleteById).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when team does not exist', async () => {
      vi.mocked(mockRepositories.teamsRepository.findById).mockResolvedValue(null);

      await expect(service.deleteTeam('team-1', 'user-1')).rejects.toThrow(NotFoundError);
    });

    it('throws UnprocessableError when team has connected applications', async () => {
      vi.mocked(mockRepositories.teamsRepository.findById).mockResolvedValue(team);
      vi.mocked(mockRepositories.applicationsRepository.list).mockResolvedValue([
        {
          id: 'app-1',
          name: 'app',
          teamId: 'team-1',
          teamName: 'my-team',
          description: null,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
          deletedAt: null,
        },
      ]);
      vi.mocked(mockRepositories.teamsRepository.count).mockResolvedValue(2);

      await expect(service.deleteTeam('team-1', 'user-1')).rejects.toThrow(UnprocessableError);
      await expect(service.deleteTeam('team-1', 'user-1')).rejects.toMatchObject({
        context: { teamId: 'team-1', rule: TeamDeleteErrorCode.HasApplications },
      });
      expect(mockRepositories.teamsRepository.softDeleteById).not.toHaveBeenCalled();
    });

    it('throws UnprocessableError when team is the only team in the org', async () => {
      vi.mocked(mockRepositories.teamsRepository.findById).mockResolvedValue(team);
      vi.mocked(mockRepositories.applicationsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.teamsRepository.count).mockResolvedValue(1);

      await expect(service.deleteTeam('team-1', 'user-1')).rejects.toThrow(UnprocessableError);
      await expect(service.deleteTeam('team-1', 'user-1')).rejects.toMatchObject({
        context: { teamId: 'team-1', rule: TeamDeleteErrorCode.LastTeam },
      });
      expect(mockRepositories.teamsRepository.softDeleteById).not.toHaveBeenCalled();
    });
  });

  describe('getTeamByName', () => {
    it('fetches team by name', async () => {
      vi.mocked(mockRepositories.teamsRepository.getByName).mockResolvedValue(team);

      await service.getTeamByName(team.name);

      expect(mockRepositories.teamsRepository.getByName).toHaveBeenCalledExactlyOnceWith(team.name);
    });
  });

  describe('addMembers', () => {
    it('adds each user to the team', async () => {
      await service.addMembers('team-1', ['user-1', 'user-2'], 'actor-1');

      expect(mockRepositories.teamsRepository.addMember).toHaveBeenCalledTimes(2);
      expect(mockRepositories.teamsRepository.addMember).toHaveBeenCalledWith('team-1', 'user-1');
      expect(mockRepositories.teamsRepository.addMember).toHaveBeenCalledWith('team-1', 'user-2');
    });
  });

  describe('removeMember', () => {
    it('removes the user from the team', async () => {
      const membership = {
        id: 'tm-1',
        teamId: 'team-1',
        userId: 'user-1',
        membershipKey: null,
        createdAt: new Date(),
      };
      vi.mocked(mockRepositories.teamsRepository.removeMember).mockResolvedValue(membership);

      const result = await service.removeMember('team-1', 'user-1', 'actor-1');

      expect(result).toEqual(membership);
      expect(mockRepositories.teamsRepository.removeMember).toHaveBeenCalledExactlyOnceWith('team-1', 'user-1');
    });

    it('throws NotFoundError when the user is not a member', async () => {
      vi.mocked(mockRepositories.teamsRepository.removeMember).mockResolvedValue(null);

      await expect(service.removeMember('team-1', 'user-1', 'actor-1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('authorization', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockAssertCanWrite.mockRejectedValue(notAMemberError());
    });

    afterEach(() => {
      mockAssertCanWrite.mockReset();
    });

    describe('deleteTeam', () => {
      it('authorizes on the target team before writing', async () => {
        await expect(service.deleteTeam('team-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'team', 'team-1');
        expect(mockRepositories.teamsRepository.softDeleteById).not.toHaveBeenCalled();
        expect(mockRepositories.teamsRepository.hardDeleteById).not.toHaveBeenCalled();
      });
    });

    describe('addMembers', () => {
      it('authorizes the caller on the target team before writing', async () => {
        await expect(service.addMembers('team-1', ['user-2'], 'user-1')).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'team', 'team-1');
        expect(mockRepositories.teamsRepository.addMember).not.toHaveBeenCalled();
      });

      it('denies a caller adding themselves to a team they are not in', async () => {
        await expect(service.addMembers('team-1', ['user-1'], 'user-1')).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockRepositories.teamsRepository.addMember).not.toHaveBeenCalled();
      });
    });

    describe('removeMember', () => {
      it('authorizes the caller on the target team before writing', async () => {
        await expect(service.removeMember('team-1', 'user-2', 'user-1')).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'team', 'team-1');
        expect(mockRepositories.teamsRepository.removeMember).not.toHaveBeenCalled();
      });
    });
  });
});
