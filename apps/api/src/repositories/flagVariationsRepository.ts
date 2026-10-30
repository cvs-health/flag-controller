// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { applications } from 'db/schema/applications.js';
import { featureFlags } from 'db/schema/featureFlags.js';
import { flagVariations } from 'db/schema/flagVariations.js';
import { and, count, eq, inArray, isNull, sql, type SQLWrapper } from 'drizzle-orm';

import getOrderByFromSort from 'utils/getOrderByFromSort.js';
import withPagination from 'utils/withPagination.js';
import type { IncludeFilters } from '../types/common.js';
import type { DbOrTx } from '../types/db.js';
import type { RepositoryListParams } from '../types/repositories.js';
import { InternalError, NotFoundError } from '../errors/AppError.js';

export type FlagVariationsSelect = typeof flagVariations.$inferSelect;
export type FlagVariationsInsert = typeof flagVariations.$inferInsert;
export type FlagVariationsUpdate = Partial<Pick<FlagVariationsInsert, 'key' | 'value'>>;
export type FlagVariationsCreate = Pick<FlagVariationsInsert, 'key' | 'value' | 'flagId'>;
export type FlagVariationsRepository = ReturnType<typeof createFlagVariationsRepository>;

export interface FlagVariationsListFilters {
  flagIds?: string[];
  ids?: string[];
  include?: IncludeFilters;
  keys?: string[];
}

const FLAG_VARIATIONS_COLUMNS = {
  createdAt: flagVariations.createdAt,
  deletedAt: flagVariations.deletedAt,
  flagId: flagVariations.flagId,
  id: flagVariations.id,
  key: flagVariations.key,
  updatedAt: flagVariations.updatedAt,
  value: flagVariations.value,
};

function createFlagVariationsRepository(db: DbOrTx) {
  const repository = {
    findOwningTeamId: async (id: string) => {
      const [row = null] = await db
        .select({ teamId: applications.teamId })
        .from(flagVariations)
        .innerJoin(featureFlags, eq(flagVariations.flagId, featureFlags.id))
        .innerJoin(applications, eq(featureFlags.applicationId, applications.id))
        .where(eq(flagVariations.id, id))
        .limit(1);

      return row?.teamId ?? null;
    },

    create: async (payload: FlagVariationsCreate) => {
      const [variation] = await db.insert(flagVariations).values(payload).returning(FLAG_VARIATIONS_COLUMNS);

      if (!variation) {
        throw new InternalError({ message: 'Insert returned no variation row' });
      }

      return variation;
    },

    list: async (
      params: RepositoryListParams<FlagVariationsListFilters, never, typeof flagVariations.$inferSelect>,
    ) => {
      const conditions = buildListConditions(params.filters);
      const orderBy = getOrderByFromSort(flagVariations, 'key:asc', params.sort);
      const query = db
        .select(FLAG_VARIATIONS_COLUMNS)
        .from(flagVariations)
        .where(conditions)
        .orderBy(orderBy)
        .$dynamic();

      withPagination(query, params.pagination);

      return query;
    },

    count: async (filters?: FlagVariationsListFilters) => {
      const conditions = buildListConditions(filters);
      const [result = { count: 0 }] = await db.select({ count: count() }).from(flagVariations).where(conditions);

      return result.count;
    },

    exists: async (filters: FlagVariationsListFilters) => {
      const conditions = buildListConditions(filters);
      const result = await db.select(FLAG_VARIATIONS_COLUMNS).from(flagVariations).where(conditions).limit(1);

      return !!result.length;
    },

    findById: async (id: string) => {
      const [variation = null] = await db
        .select(FLAG_VARIATIONS_COLUMNS)
        .from(flagVariations)
        .where(eq(flagVariations.id, id))
        .limit(1);

      return variation;
    },

    getById: async (id: string) => {
      const variation = await repository.findById(id);

      if (!variation) {
        throw new NotFoundError({ message: 'Variation not found', detail: 'Variation not found.', context: { id } });
      }

      return variation;
    },

    updateById: async (id: string, payload: FlagVariationsUpdate) => {
      const [updated = null] = await db
        .update(flagVariations)
        .set(payload)
        .where(eq(flagVariations.id, id))
        .returning();

      if (!updated) {
        throw new NotFoundError({ message: 'Variation not found', detail: 'Variation not found.', context: { id } });
      }

      return updated;
    },

    softDeleteById: async (id: string) => {
      const [deleted = null] = await db
        .update(flagVariations)
        .set({ deletedAt: sql`now()` })
        .where(eq(flagVariations.id, id))
        .returning();

      if (!deleted) {
        throw new NotFoundError({ message: 'Variation not found', detail: 'Variation not found.', context: { id } });
      }

      return deleted;
    },
  };
  return repository;
}

function buildListConditions(filters?: FlagVariationsListFilters) {
  const conditions: SQLWrapper[] = [];

  if (!filters) {
    return and(isNull(flagVariations.deletedAt));
  }

  if (!filters.include?.deleted) {
    conditions.push(isNull(flagVariations.deletedAt));
  }

  if (filters.ids?.length) {
    conditions.push(inArray(flagVariations.id, filters.ids));
  }

  if (filters.flagIds?.length) {
    conditions.push(inArray(flagVariations.flagId, filters.flagIds));
  }

  if (filters.keys?.length) {
    conditions.push(inArray(flagVariations.key, filters.keys));
  }

  return conditions.length ? and(...conditions) : undefined;
}

export default createFlagVariationsRepository;
