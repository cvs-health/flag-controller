// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, count, eq, ilike, inArray } from 'drizzle-orm';
import type { SQLWrapper } from 'drizzle-orm/sql';
import { type EnvironmentKey, FieldErrorCode } from 'shared-types';

import getOrderByFromSort from '../utils/getOrderByFromSort.js';
import type { DbOrTx } from '../types/db.js';
import type { RepositoryListParams } from '../types/repositories.js';
import withPagination from '../utils/withPagination.js';
import { ConflictError, InternalError, NotFoundError } from '../errors/AppError.js';
import { applications } from 'db/schema/applications.js';
import { environments } from 'db/schema/environments.js';
import { isUniqueViolation } from '../utils/pgErrors.js';

export type EnvironmentSelect = typeof environments.$inferSelect;
export type EnvironmentInsert = Omit<typeof environments.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type EnvironmentsRepository = ReturnType<typeof createEnvironmentsRepository>;

export interface EnvironmentFilters {
  applicationId?: string;
  environmentIds?: string[];
  search?: string;
  keys?: EnvironmentKey[];
}

function buildListConditions(filters?: EnvironmentFilters) {
  const conditions: SQLWrapper[] = [];
  if (filters?.applicationId) {
    conditions.push(eq(environments.applicationId, filters.applicationId));
  }
  if (filters?.search) {
    conditions.push(ilike(environments.key, `%${filters.search}%`));
  }
  if (filters?.keys?.length) {
    conditions.push(inArray(environments.key, filters.keys));
  }
  if (filters?.environmentIds?.length) {
    conditions.push(inArray(environments.id, filters.environmentIds));
  }

  return conditions.length ? and(...conditions) : undefined;
}

function environmentKeyConflict(context: Record<string, unknown>, cause: unknown) {
  return new ConflictError({
    message: 'Environment with this key already exists for the application',
    detail: 'An environment with this key already exists for this application.',
    errors: [{ field: 'key', code: FieldErrorCode.Duplicate }],
    context,
    cause,
  });
}

function createEnvironmentsRepository(db: DbOrTx) {
  const repository = {
    findOwningTeamId: async (id: string) => {
      const [row = null] = await db
        .select({ teamId: applications.teamId })
        .from(environments)
        .innerJoin(applications, eq(environments.applicationId, applications.id))
        .where(eq(environments.id, id))
        .limit(1);

      return row?.teamId ?? null;
    },

    create: async (payload: EnvironmentInsert) => {
      try {
        const [inserted] = await db.insert(environments).values(payload).returning();
        if (!inserted) {
          throw new InternalError({ message: 'Insert returned no environment row' });
        }
        return inserted;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw environmentKeyConflict({ applicationId: payload.applicationId, key: payload.key }, error);
        }
        throw error;
      }
    },

    createMany: async (payloads: EnvironmentInsert[]) => {
      return await Promise.all(payloads.map((payload) => repository.create(payload)));
    },

    findById: async (id: string) => {
      const [environment = null] = await db.select().from(environments).where(eq(environments.id, id)).limit(1);

      return environment;
    },

    getById: async (id: string) => {
      const environment = await repository.findById(id);

      if (!environment) {
        throw new NotFoundError({
          message: 'Environment not found',
          detail: 'Environment not found.',
          context: { id },
        });
      }

      return environment;
    },

    findByKey: async (applicationId: string, key: EnvironmentKey) => {
      const [environment = null] = await db
        .select()
        .from(environments)
        .where(and(eq(environments.applicationId, applicationId), eq(environments.key, key)))
        .limit(1);

      return environment;
    },

    getByKey: async (applicationId: string, key: EnvironmentKey) => {
      const environment = await repository.findByKey(applicationId, key);
      if (!environment) {
        throw new NotFoundError({
          message: 'Environment not found',
          detail: 'Environment not found.',
          context: { applicationId, key },
        });
      }
      return environment;
    },

    list: async (params: RepositoryListParams<EnvironmentFilters, never, typeof environments.$inferSelect>) => {
      const whereConditions = buildListConditions(params.filters);
      const orderBy = getOrderByFromSort(environments, 'createdAt:asc', params.sort);

      const dataQuery = db.select().from(environments).where(whereConditions).orderBy(orderBy).$dynamic();

      withPagination(dataQuery, params.pagination);

      return dataQuery;
    },

    count: async (filters?: EnvironmentFilters) => {
      const whereConditions = buildListConditions(filters);
      const result = await db.select({ count: count() }).from(environments).where(whereConditions);
      return result[0]?.count ?? 0;
    },

    updateById: async (id: string, payload: Partial<EnvironmentInsert>) => {
      try {
        const [updated = null] = await db.update(environments).set(payload).where(eq(environments.id, id)).returning();

        return updated;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw environmentKeyConflict({ id, key: payload.key }, error);
        }
        throw error;
      }
    },

    hardDeleteById: async (id: string) => {
      const [deleted = null] = await db.delete(environments).where(eq(environments.id, id)).returning();

      return deleted;
    },

    exists: async (applicationId: string, key: EnvironmentKey) => {
      const [result] = await db
        .select({ id: environments.id })
        .from(environments)
        .where(and(eq(environments.applicationId, applicationId), eq(environments.key, key)))
        .limit(1);
      return !!result;
    },
  };
  return repository;
}

export default createEnvironmentsRepository;
