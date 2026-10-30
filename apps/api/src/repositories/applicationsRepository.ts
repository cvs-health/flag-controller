// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, count, eq, ilike, inArray, isNull, sql, type SQLWrapper } from 'drizzle-orm';
import { FieldErrorCode } from 'shared-types';

import { applications } from 'db/schema/applications.js';
import { teams } from 'db/schema/auth.js';
import withPagination from 'utils/withPagination.js';
import type { IncludeFilters } from '../types/common.js';
import type { DbOrTx } from '../types/db.js';
import type { RepositoryListParams } from '../types/repositories.js';
import { isUniqueViolation } from '../utils/pgErrors.js';
import { ConflictError, InternalError, NotFoundError } from '../errors/AppError.js';

export type ApplicationSelect = typeof applications.$inferSelect;
export type ApplicationInsert = Omit<typeof applications.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;

interface ApplicationsListFilters {
  names?: string[];
  search?: string;
  teamIds?: string[];
  include?: IncludeFilters;
}

const APPLICATION_TABLE_COLUMNS = {
  createdAt: applications.createdAt,
  deletedAt: applications.deletedAt,
  description: applications.description,
  id: applications.id,
  name: applications.name,
  teamId: applications.teamId,
  updatedAt: applications.updatedAt,
};

const APPLICATION_TABLE_COLUMNS_JOINED = {
  ...APPLICATION_TABLE_COLUMNS,
  teamName: teams.name,
};

function createApplicationsRepository(db: DbOrTx) {
  const repository = {
    findOwningTeamId: async (id: string) => {
      const [row = null] = await db
        .select({ teamId: applications.teamId })
        .from(applications)
        .where(eq(applications.id, id))
        .limit(1);

      return row?.teamId ?? null;
    },

    list: async (params: RepositoryListParams<ApplicationsListFilters>) => {
      const conditions = buildListConditions(params.filters);
      const query = db
        .select(APPLICATION_TABLE_COLUMNS_JOINED)
        .from(applications)
        .leftJoin(teams, eq(applications.teamId, teams.id))
        .where(conditions)
        .$dynamic();

      withPagination(query, params.pagination);

      return query;
    },
    count: async (filters?: ApplicationsListFilters) => {
      const conditions = buildListConditions(filters);
      const [result = { count: 0 }] = await db.select({ count: count() }).from(applications).where(conditions);

      return result.count;
    },
    create: async (payload: ApplicationInsert) => {
      try {
        const [application] = await db.insert(applications).values(payload).returning();

        if (!application) {
          throw new InternalError({ message: 'Insert returned no application row' });
        }

        return application;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new ConflictError({
            message: 'Application with this name already exists',
            detail: 'An application with this name already exists.',
            errors: [{ field: 'name', code: FieldErrorCode.Duplicate }],
            context: { name: payload.name },
            cause: error,
          });
        }

        throw error;
      }
    },

    hardDeleteById: async (id: string) => {
      const [deleted = null] = await db.delete(applications).where(eq(applications.id, id)).returning();

      if (!deleted) {
        throw new NotFoundError({
          message: 'Application not found',
          detail: 'Application not found.',
          context: { id },
        });
      }

      return deleted;
    },

    softDeleteById: async (id: string) => {
      const [deleted = null] = await db
        .update(applications)
        .set({ deletedAt: sql`now()` })
        .where(eq(applications.id, id))
        .returning();

      if (!deleted) {
        throw new NotFoundError({
          message: 'Application not found',
          detail: 'Application not found.',
          context: { id },
        });
      }

      return deleted;
    },

    findById: async (id: string) => {
      const [application = null] = await db
        .select(APPLICATION_TABLE_COLUMNS_JOINED)
        .from(applications)
        .leftJoin(teams, eq(applications.teamId, teams.id))
        .where(eq(applications.id, id))
        .limit(1);

      return application;
    },

    findByName: async (name: string) => {
      const [application = null] = await db
        .select(APPLICATION_TABLE_COLUMNS_JOINED)
        .from(applications)
        .leftJoin(teams, eq(applications.teamId, teams.id))
        .where(eq(applications.name, name))
        .limit(1);

      return application;
    },

    getById: async (id: string) => {
      const application = await repository.findById(id);

      if (!application) {
        throw new NotFoundError({
          message: 'Application not found',
          detail: 'Application not found.',
          context: { id },
        });
      }

      return application;
    },

    getByName: async (name: string) => {
      const [application] = await db
        .select(APPLICATION_TABLE_COLUMNS_JOINED)
        .from(applications)
        .leftJoin(teams, eq(applications.teamId, teams.id))
        .where(eq(applications.name, name))
        .limit(1);

      if (!application) {
        throw new NotFoundError({
          message: 'Application not found',
          detail: 'Application not found.',
          context: { name },
        });
      }

      return application;
    },

    updateById: async (id: string, payload: Partial<ApplicationInsert>) => {
      const [updated = null] = await db.update(applications).set(payload).where(eq(applications.id, id)).returning();

      return updated;
    },
  };

  return repository;
}

function buildListConditions(filters?: ApplicationsListFilters) {
  const conditions: SQLWrapper[] = [];

  if (!filters) {
    return and(isNull(applications.deletedAt));
  }

  if (!filters.include?.deleted) {
    conditions.push(isNull(applications.deletedAt));
  }

  if (filters.teamIds?.length) {
    conditions.push(inArray(applications.teamId, filters.teamIds));
  }

  if (filters.names?.length) {
    conditions.push(inArray(applications.name, filters.names));
  }

  if (filters.search) {
    conditions.push(ilike(applications.name, `%${filters.search}%`));
  }

  return conditions.length ? and(...conditions) : undefined;
}

export default createApplicationsRepository;
