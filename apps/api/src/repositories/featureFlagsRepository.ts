// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, count, eq, gte, ilike, inArray, isNull, lte, sql, type SQLWrapper } from 'drizzle-orm';
import { type FeatureFlagType, FieldErrorCode } from 'shared-types';

import { applications } from 'db/schema/applications.js';
import { featureFlags } from 'db/schema/featureFlags.js';
import getOrderByFromSort from 'utils/getOrderByFromSort.js';
import withPagination from 'utils/withPagination.js';
import { isUniqueViolation } from 'utils/pgErrors.js';
import type { IncludeFilters } from '../types/common.js';
import type { DbOrTx } from '../types/db.js';
import type { RepositoryListParams } from '../types/repositories.js';
import { ConflictError, InternalError, NotFoundError } from '../errors/AppError.js';

export type FeatureFlagsInsert = typeof featureFlags.$inferInsert;
export type FeatureFlagsSelect = typeof featureFlags.$inferSelect;
export type FeatureFlagsJoined = FeatureFlagsSelect & { applicationName: string };
export type FeatureFlagsUpdate = Partial<Pick<FeatureFlagsInsert, 'archived' | 'description'>>;
export type FeatureFlagsRepository = ReturnType<typeof createFeatureFlagsRepository>;

export interface FeatureFlagsListFilters {
  applicationIds?: string[];
  archived?: boolean;
  createdAtEndDate?: string;
  createdAtStartDate?: string;
  featureFlagTypes?: FeatureFlagType[];
  flagIds?: string[];
  include?: IncludeFilters;
  keys?: string[];
  search?: string;
  updatedAtEndDate?: string;
  updatedAtStartDate?: string;
}

const ALL_TABLE_COLUMNS = {
  applicationId: featureFlags.applicationId,
  applicationName: applications.name,
  archived: featureFlags.archived,
  createdAt: featureFlags.createdAt,
  deletedAt: featureFlags.deletedAt,
  description: featureFlags.description,
  id: featureFlags.id,
  key: featureFlags.key,
  type: featureFlags.type,
  updatedAt: featureFlags.updatedAt,
} as const;

function createFeatureFlagsRepository(db: DbOrTx) {
  const repository = {
    findOwningTeamId: async (id: string) => {
      const [row = null] = await db
        .select({ teamId: applications.teamId })
        .from(featureFlags)
        .innerJoin(applications, eq(featureFlags.applicationId, applications.id))
        .where(eq(featureFlags.id, id))
        .limit(1);

      return row?.teamId ?? null;
    },

    count: async (filters?: FeatureFlagsListFilters) => {
      const conditions = buildListConditions(filters);
      const [result = { count: 0 }] = await db.select({ count: count() }).from(featureFlags).where(conditions);

      return result.count;
    },

    create: async (payload: FeatureFlagsInsert) => {
      try {
        const [featureFlag] = await db.insert(featureFlags).values(payload).returning();

        if (!featureFlag) {
          throw new InternalError({ message: 'Insert returned no feature flag row' });
        }

        return featureFlag;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new ConflictError({
            message: 'Feature flag with this key already exists',
            detail: 'A feature flag with this key already exists for this application.',
            errors: [{ field: 'key', code: FieldErrorCode.Duplicate }],
            context: { applicationId: payload.applicationId, key: payload.key },
            cause: error,
          });
        }

        throw error;
      }
    },

    findById: async (id: string) => {
      const [featureFlag = null] = await db
        .select(ALL_TABLE_COLUMNS)
        .from(featureFlags)
        .innerJoin(applications, eq(featureFlags.applicationId, applications.id))
        .where(eq(featureFlags.id, id))
        .limit(1);

      return featureFlag;
    },

    findByKey: async (applicationId: string, featureFlagKey: string) => {
      const [featureFlag = null] = await db
        .select(ALL_TABLE_COLUMNS)
        .from(featureFlags)
        .innerJoin(applications, eq(featureFlags.applicationId, applications.id))
        .where(and(eq(featureFlags.key, featureFlagKey), eq(featureFlags.applicationId, applicationId)))
        .limit(1);

      return featureFlag;
    },

    findByApplicationNameAndKey: async (applicationName: string, featureFlagKey: string) => {
      const [featureFlag = null] = await db
        .select(ALL_TABLE_COLUMNS)
        .from(featureFlags)
        .innerJoin(applications, eq(featureFlags.applicationId, applications.id))
        .where(and(eq(featureFlags.key, featureFlagKey), eq(applications.name, applicationName)))
        .limit(1);

      return featureFlag;
    },

    getById: async (id: string) => {
      const featureFlag = await repository.findById(id);

      if (!featureFlag) {
        throw new NotFoundError({
          message: 'Feature flag not found',
          detail: 'Feature flag not found.',
          context: { id },
        });
      }

      return featureFlag;
    },

    getByApplicationNameAndKey: async (applicationName: string, featureFlagKey: string) => {
      const featureFlag = await repository.findByApplicationNameAndKey(applicationName, featureFlagKey);

      if (!featureFlag) {
        throw new NotFoundError({
          message: 'Feature flag not found',
          detail: 'Feature flag not found.',
          context: { applicationName, featureFlagKey },
        });
      }

      return featureFlag;
    },

    list: async (params: RepositoryListParams<FeatureFlagsListFilters, null, FeatureFlagsJoined>) => {
      const conditions = buildListConditions(params.filters);
      const orderBy = getOrderByFromSort(ALL_TABLE_COLUMNS, 'key:asc', params.sort);
      const query = db
        .select(ALL_TABLE_COLUMNS)
        .from(featureFlags)
        .innerJoin(applications, eq(featureFlags.applicationId, applications.id))
        .where(conditions)
        .orderBy(orderBy)
        .$dynamic();

      return withPagination(query, params.pagination);
    },

    updateById: async (id: string, payload: FeatureFlagsUpdate) => {
      const [flag] = await db.update(featureFlags).set(payload).where(eq(featureFlags.id, id)).returning();

      if (!flag) {
        throw new NotFoundError({
          message: 'Feature flag not found',
          detail: 'Feature flag not found.',
          context: { id },
        });
      }

      return repository.getById(flag.id);
    },

    softDeleteMany: async (ids: string[]) => {
      if (!ids.length) {
        return [];
      }

      const deleted = await db.select().from(featureFlags).where(inArray(featureFlags.id, ids)).for('update');

      await db.update(featureFlags).set({ deletedAt: sql`now()` }).where(inArray(featureFlags.id, ids));

      return deleted;
    },
  };

  return repository;
}

function buildListConditions(filters?: FeatureFlagsListFilters) {
  const conditions: SQLWrapper[] = [];

  if (!filters) {
    return and(isNull(featureFlags.deletedAt), eq(featureFlags.archived, false));
  }

  if (!filters.include?.deleted) {
    conditions.push(isNull(featureFlags.deletedAt));
  }

  if (filters.archived === true) {
    conditions.push(eq(featureFlags.archived, true));
  } else if (!filters.include?.archived) {
    conditions.push(eq(featureFlags.archived, false));
  }

  if (filters.featureFlagTypes?.length) {
    conditions.push(inArray(featureFlags.type, filters.featureFlagTypes));
  }

  if (filters.createdAtStartDate) {
    conditions.push(gte(featureFlags.createdAt, new Date(filters.createdAtStartDate)));
  }

  if (filters.createdAtEndDate) {
    conditions.push(lte(featureFlags.createdAt, new Date(filters.createdAtEndDate)));
  }

  if (filters.updatedAtStartDate) {
    conditions.push(gte(featureFlags.updatedAt, new Date(filters.updatedAtStartDate)));
  }

  if (filters.updatedAtEndDate) {
    conditions.push(lte(featureFlags.updatedAt, new Date(filters.updatedAtEndDate)));
  }

  if (filters.applicationIds?.length) {
    conditions.push(inArray(featureFlags.applicationId, filters.applicationIds));
  }

  if (filters.flagIds?.length) {
    conditions.push(inArray(featureFlags.id, filters.flagIds));
  }

  if (filters.keys?.length) {
    conditions.push(inArray(featureFlags.key, filters.keys));
  }

  if (filters.search) {
    conditions.push(ilike(featureFlags.key, `%${filters.search}%`));
  }

  return conditions.length ? and(...conditions) : undefined;
}

export default createFeatureFlagsRepository;
