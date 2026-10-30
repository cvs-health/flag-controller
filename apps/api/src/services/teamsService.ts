// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { TeamDeleteErrorCode } from 'shared-types';

import type { ListTeamsFilters } from 'repositories/teamsRepository.js';
import type { ListUsersFilters } from 'repositories/usersRepository.js';
import type { ServiceDependencies, ServiceListParams } from '../types/services.js';
import type { With } from '../types/common.js';
import type { teams, users } from 'db/schema/auth.js';
import { NotFoundError, UnprocessableError } from '../errors/AppError.js';
import { PAGINATION_NO_LIMIT } from '../constants/pagination.js';

interface ListTeamsWith extends With {
  applications: boolean;
}

export type TeamsService = ReturnType<typeof createTeamsService>;

function createTeamsService({ repositories, assertCanWrite, withTransaction }: ServiceDependencies) {
  return {
    addMembers: async (teamId: string, userIds: string[], actorUserId: string) => {
      await assertCanWrite(actorUserId, 'team', teamId);

      const uniqueUserIds = [...new Set(userIds)];

      return withTransaction(async (repos) => {
        const members = [];
        for (const userId of uniqueUserIds) {
          members.push(await repos.teamsRepository.addMember(teamId, userId));
        }

        return members;
      });
    },
    removeMember: async (teamId: string, userId: string, actorUserId: string) => {
      await assertCanWrite(actorUserId, 'team', teamId);

      const removed = await repositories.teamsRepository.removeMember(teamId, userId);
      if (!removed) {
        throw new NotFoundError({
          message: `Team member not found: ${userId} in ${teamId}`,
          detail: 'Team member not found.',
          context: { teamId, userId },
        });
      }

      return removed;
    },
    getTeamByName: async (teamName: string) => {
      const team = await repositories.teamsRepository.getByName(teamName);

      return team;
    },
    listMembers: async (params: ServiceListParams<typeof users.$inferSelect, ListUsersFilters>) => {
      const [teamsResult, countResult] = await Promise.all([
        repositories.usersRepository.list({
          filters: params.filters,
          pagination: {
            limit: params.pagination.rows,
            offset: (params.pagination.page - 1) * params.pagination.rows,
          },
          sort: {
            direction: params.sort.direction,
            field: params.sort.field,
          },
        }),
        repositories.usersRepository.count({ filters: params.filters }),
      ]);
      const baseResponse = {
        data: [],
        metadata: {
          page: params.pagination.page,
          records: teamsResult.length,
          rows: params.pagination.rows,
          totalPages: params.pagination.rows > 0 ? Math.ceil(countResult / params.pagination.rows) : 0,
          totalRecords: countResult,
        },
      };

      if (!teamsResult.length) {
        return baseResponse;
      }

      if (params.with?.applications) {
        const teamIds = teamsResult.map((team) => team.id);
        const applications = await repositories.applicationsRepository.list({
          filters: { teamIds: teamIds },
          pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
        });
        const data = teamsResult.map((team) => ({
          ...team,
          applications: applications.filter((app) => app.teamId === team.id),
        }));

        return {
          ...baseResponse,
          data,
        };
      }

      return {
        ...baseResponse,
        data: teamsResult,
      };
    },
    listTeams: async (params: ServiceListParams<typeof teams.$inferSelect, ListTeamsFilters, ListTeamsWith>) => {
      const [teamsResult, countResult] = await Promise.all([
        repositories.teamsRepository.list({
          filters: params.filters,
          pagination: {
            limit: params.pagination.rows,
            offset: (params.pagination.page - 1) * params.pagination.rows,
          },
          sort: {
            direction: params.sort.direction,
            field: params.sort.field,
          },
        }),
        repositories.teamsRepository.count({ filters: params.filters }),
      ]);
      const baseResponse = {
        data: [],
        metadata: {
          page: params.pagination.page,
          records: teamsResult.length,
          rows: params.pagination.rows,
          totalPages: params.pagination.rows > 0 ? Math.ceil(countResult / params.pagination.rows) : 0,
          totalRecords: countResult,
        },
      };

      if (!teamsResult.length) {
        return baseResponse;
      }

      if (params.with?.applications) {
        const teamIds = teamsResult.map((team) => team.id);
        const applications = await repositories.applicationsRepository.list({
          filters: { teamIds: teamIds },
          pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
        });
        const data = teamsResult.map((team) => ({
          ...team,
          applications: applications.filter((app) => app.teamId === team.id),
        }));

        return {
          ...baseResponse,
          data,
        };
      }

      return {
        ...baseResponse,
        data: teamsResult,
      };
    },
    deleteTeam: async (teamId: string, userId: string, hard = false) => {
      await assertCanWrite(userId, 'team', teamId);

      const team = await repositories.teamsRepository.findById(teamId);
      if (!team) {
        throw new NotFoundError({
          message: `Team not found: ${teamId}`,
          detail: 'Team not found.',
          context: { teamId },
        });
      }

      const [applications, countResult] = await Promise.all([
        repositories.applicationsRepository.list({
          filters: { teamIds: [teamId] },
          pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
        }),
        repositories.teamsRepository.count({ filters: { organizationId: team.organizationId } }),
      ]);

      if (applications.length > 0) {
        throw new UnprocessableError({
          message: 'Cannot delete team with connected applications',
          detail: 'Cannot delete team with connected applications. Remove applications first.',
          context: { teamId, rule: TeamDeleteErrorCode.HasApplications },
        });
      }

      if (countResult <= 1) {
        throw new UnprocessableError({
          message: 'Cannot delete the only team in the organization',
          detail: 'Cannot delete the only team in the organization. Create another team first.',
          context: { teamId, rule: TeamDeleteErrorCode.LastTeam },
        });
      }

      if (hard) {
        return repositories.teamsRepository.hardDeleteById(teamId);
      }

      return repositories.teamsRepository.softDeleteById(teamId);
    },
  };
}

export default createTeamsService;
