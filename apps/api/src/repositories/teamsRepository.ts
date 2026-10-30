// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { teamMembers, teams } from 'db/schema/auth.js';
import { and, count, countDistinct, eq, inArray, isNull, sql, type SQL } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import getOrderByFromSort from 'utils/getOrderByFromSort.js';
import { InternalError, NotFoundError } from '../errors/AppError.js';
import type { IncludeFilters } from '../types/common.js';
import type { DbOrTx } from '../types/db.js';
import type { RepositoryListParams } from '../types/repositories.js';
import withPagination from '../utils/withPagination.js';

export type ListTeamsFilters = {
  applicationIds?: string[];
  organizationId?: string;
  userId?: string;
  include?: IncludeFilters;
};
export type TeamsRepository = ReturnType<typeof createTeamsRepository>;

export interface UserAccessScope {
  teamIds: string[];
}

function buildListConditions(filters?: ListTeamsFilters): SQL<unknown> | undefined {
  const conditions: SQL<unknown>[] = [];

  if (!filters?.include?.deleted) {
    conditions.push(isNull(teams.deletedAt));
  }

  if (filters?.applicationIds) {
    conditions.push(inArray(teams.id, filters.applicationIds));
  }

  if (filters?.organizationId) {
    conditions.push(eq(teams.organizationId, filters.organizationId));
  }

  if (filters?.userId) {
    conditions.push(eq(teamMembers.userId, filters.userId));
  }

  return conditions.length ? and(...conditions) : undefined;
}

function createTeamsRepository(db: DbOrTx) {
  return {
    getAccessScope: async (userId: string) => {
      const rows = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId));

      return { teamIds: [...new Set(rows.map((row) => row.teamId))] };
    },

    addMember: async (teamId: string, userId: string) => {
      const [existing] = await db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
        .limit(1);

      if (existing) {
        return existing;
      }

      const [inserted] = await db
        .insert(teamMembers)
        .values({ id: nanoid(), teamId, userId, createdAt: new Date() })
        .returning();

      if (!inserted) {
        throw new InternalError({ message: 'Insert returned no team member row' });
      }

      return inserted;
    },

    removeMember: async (teamId: string, userId: string) => {
      const [deleted = null] = await db
        .delete(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
        .returning();

      return deleted;
    },

    list: async (params: RepositoryListParams<ListTeamsFilters>) => {
      const whereCondition = buildListConditions(params.filters);
      const orderBy = getOrderByFromSort(teams, 'updatedAt:asc', params.sort);

      const baseQuery = db
        .select({
          id: teams.id,
          name: teams.name,
          organizationId: teams.organizationId,
        })
        .from(teams);

      const query = params.filters?.userId
        ? baseQuery.innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
        : baseQuery;

      const dynamicQuery = query.$dynamic().where(whereCondition).orderBy(orderBy);

      withPagination(dynamicQuery, params.pagination);

      return await dynamicQuery;
    },
    count: async (params?: Omit<RepositoryListParams<ListTeamsFilters>, 'pagination'>) => {
      const whereCondition = buildListConditions(params?.filters);

      if (params?.filters?.userId) {
        const [result = { count: 0 }] = await db
          .selectDistinct({ count: countDistinct(teams.id) })
          .from(teams)
          .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
          .where(whereCondition);

        return result.count;
      }

      const [result = { count: 0 }] = await db.select({ count: count() }).from(teams).where(whereCondition);

      return result.count;
    },
    findById: async (id: string) => {
      const [team = null] = await db.select().from(teams).where(eq(teams.id, id)).limit(1);

      return team;
    },
    getByName: async (name: string) => {
      const [team = null] = await db.select().from(teams).where(eq(teams.name, name)).limit(1);

      if (!team) {
        throw new NotFoundError({ message: 'Team not found', detail: 'Team not found.', context: { name } });
      }

      return team;
    },
    softDeleteById: async (id: string) => {
      const [updated = null] = await db
        .update(teams)
        .set({ deletedAt: sql`now()` })
        .where(eq(teams.id, id))
        .returning();

      return updated;
    },
    hardDeleteById: async (id: string) => {
      const [deleted = null] = await db.delete(teams).where(eq(teams.id, id)).returning();

      return deleted;
    },
  };
}

export default createTeamsRepository;
