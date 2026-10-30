// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, eq, inArray, isNull, sql } from 'drizzle-orm';

import type { DbOrTx } from '../types/db.js';
import type { IncludeFilters } from '../types/common.js';
import type { RepositoryListParams } from '../types/repositories.js';
import withPagination from 'utils/withPagination.js';
import { InternalError, NotFoundError } from '../errors/AppError.js';
import { fractionals } from 'db/schema/fractionals.js';

export const FRACTIONALS_TABLE_COLUMNS = {
  id: fractionals.id,
  type: fractionals.type,
  weights: fractionals.weights,
  var: fractionals.var,
  createdAt: fractionals.createdAt,
  updatedAt: fractionals.updatedAt,
  deletedAt: fractionals.deletedAt,
};

interface FractionalsListFilters {
  fractionalIds?: string[];
  include?: IncludeFilters;
}

export type FractionalsInsert = typeof fractionals.$inferInsert;
export type FractionalsSelect = typeof fractionals.$inferSelect;
export type FractionalsCreate = Pick<FractionalsInsert, 'type' | 'weights' | 'var'>;
export type FractionalsUpdate = Partial<FractionalsCreate>;
export type FractionalsRepository = ReturnType<typeof createFractionalsRepository>;

function createFractionalsRepository(db: DbOrTx) {
  const repository = {
    create: async (payload: FractionalsCreate) => {
      const [fractional] = await db.insert(fractionals).values(payload).returning();

      if (!fractional) {
        throw new InternalError({ message: 'Insert returned no fractional row' });
      }

      return fractional;
    },
    findById: async (id: string) => {
      const [fractional = null] = await db.select().from(fractionals).where(eq(fractionals.id, id)).limit(1);

      return fractional;
    },
    getById: async (id: string) => {
      const fractional = await repository.findById(id);

      if (!fractional) {
        throw new NotFoundError({ message: 'Fractional not found', detail: 'Fractional not found.', context: { id } });
      }

      return fractional;
    },
    list: async (params: RepositoryListParams<FractionalsListFilters>) => {
      const conditions = buildListConditions(params.filters);
      const query = db.select(FRACTIONALS_TABLE_COLUMNS).from(fractionals).where(conditions).$dynamic();

      withPagination(query, params.pagination);

      return query;
    },
    softDeleteById: async (id: string) => {
      const [updated = null] = await db
        .update(fractionals)
        .set({ deletedAt: sql`now()` })
        .where(eq(fractionals.id, id))
        .returning();

      return updated;
    },
    hardDeleteById: async (id: string) => {
      const [deleted = null] = await db.delete(fractionals).where(eq(fractionals.id, id)).returning();

      return deleted;
    },
    updateById: async (id: string, payload: FractionalsUpdate) => {
      const [fractional] = await db.update(fractionals).set(payload).where(eq(fractionals.id, id)).returning();

      if (!fractional) {
        throw new NotFoundError({ message: 'Fractional not found', detail: 'Fractional not found.', context: { id } });
      }

      return fractional;
    },
  };

  return repository;
}

function buildListConditions(filters?: FractionalsListFilters) {
  const conditions = [];

  if (!filters) {
    return and(isNull(fractionals.deletedAt));
  }

  if (!filters.include?.deleted) {
    conditions.push(isNull(fractionals.deletedAt));
  }

  if (filters.fractionalIds?.length) {
    conditions.push(inArray(fractionals.id, filters.fractionalIds));
  }

  return conditions.length ? and(...conditions) : undefined;
}

export default createFractionalsRepository;
