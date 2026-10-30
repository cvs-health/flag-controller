// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, count, eq, inArray } from 'drizzle-orm';
import type { EnvironmentKey } from 'shared-types';

import getOrderByFromSort from 'utils/getOrderByFromSort.js';
import type { DbOrTx } from '../types/db.js';
import type { RepositoryListParams } from '../types/repositories.js';
import withPagination from 'utils/withPagination.js';
import { ConflictError, InternalError, NotFoundError } from '../errors/AppError.js';
import { environments } from 'db/schema/environments.js';
import { featureFlags } from 'db/schema/featureFlags.js';
import { flagEnvironments } from 'db/schema/flagEnvironments.js';
import { flagVariations } from 'db/schema/flagVariations.js';
import { isUniqueViolation } from 'utils/pgErrors.js';

export type FlagEnvironmentsSelect = typeof flagEnvironments.$inferSelect;
export type FlagEnvironmentsJoined = FlagEnvironmentsSelect & {
  defaultServeKey: string;
  environmentKey: EnvironmentKey;
};
export type FlagEnvironmentsInsert = typeof flagEnvironments.$inferInsert;
export type FlagEnvironmentsCreate = Omit<typeof flagEnvironments.$inferInsert, 'createdAt' | 'updatedAt'>;
export type FlagEnvironmentsRepository = ReturnType<typeof createFlagEnvironmentsRepository>;

export interface FlagEnvironmentsListFilters {
  defaultServeIds?: string[];
  enabled?: boolean;
  environmentIds?: string[];
  environmentKeys?: EnvironmentKey[];
  flagIds?: string[];
}

export type FlagEnvironmentsUpdate = Partial<Pick<FlagEnvironmentsInsert, 'enabled' | 'defaultServeId'>>;
export type FlagEnvironmentsUpdateMany = FlagEnvironmentsUpdate &
  Required<Pick<FlagEnvironmentsInsert, 'flagId' | 'environmentId'>>;

const ALL_TABLE_COLUMNS = {
  createdAt: flagEnvironments.createdAt,
  defaultServeId: flagEnvironments.defaultServeId,
  defaultServeKey: flagVariations.key,
  enabled: flagEnvironments.enabled,
  environmentId: flagEnvironments.environmentId,
  flagId: flagEnvironments.flagId,
  flag: {
    applicationId: featureFlags.applicationId,
    key: featureFlags.key,
  },
  updatedAt: flagEnvironments.updatedAt,
  environmentKey: environments.key,
};

// Flattened for `getOrderByFromSort`, which cannot traverse the nested `flag` selection
const SORTABLE_COLUMNS = {
  createdAt: flagEnvironments.createdAt,
  defaultServeId: flagEnvironments.defaultServeId,
  defaultServeKey: flagVariations.key,
  enabled: flagEnvironments.enabled,
  environmentId: flagEnvironments.environmentId,
  environmentKey: environments.key,
  flagId: flagEnvironments.flagId,
  updatedAt: flagEnvironments.updatedAt,
};

function createFlagEnvironmentsRepository(db: DbOrTx) {
  const repository = {
    create: async (payload: FlagEnvironmentsInsert) => {
      try {
        const [inserted] = await db.insert(flagEnvironments).values(payload).returning();

        if (!inserted) {
          throw new InternalError({ message: 'Insert returned no flag environment row' });
        }

        return repository.getByFlagIdAndEnvironmentId(inserted.flagId, inserted.environmentId);
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new ConflictError({
            message: 'Flag environment with this environmentId already exists for the flag',
            detail: 'This feature flag is already configured for this environment.',
            context: { environmentId: payload.environmentId, flagId: payload.flagId },
            cause: error,
          });
        }

        throw error;
      }
    },

    createMany: async (payloads: FlagEnvironmentsInsert[]) => {
      if (!payloads.length) {
        return [];
      }

      const result = await Promise.all(payloads.map((item) => repository.create(item)));

      return result;
    },

    findByFlagIdAndEnvironmentId: async (flagId: string, environmentId: string) => {
      const [flagEnvironment = null] = await db
        .select(ALL_TABLE_COLUMNS)
        .from(flagEnvironments)
        .innerJoin(environments, eq(environments.id, flagEnvironments.environmentId))
        .innerJoin(featureFlags, eq(featureFlags.id, flagEnvironments.flagId))
        .leftJoin(flagVariations, eq(flagVariations.id, flagEnvironments.defaultServeId))
        .where(and(eq(flagEnvironments.flagId, flagId), eq(flagEnvironments.environmentId, environmentId)))
        .limit(1);

      return flagEnvironment;
    },

    getByFlagIdAndEnvironmentId: async (flagId: string, environmentId: string) => {
      const flagEnvironment = await repository.findByFlagIdAndEnvironmentId(flagId, environmentId);

      if (!flagEnvironment) {
        throw new NotFoundError({
          message: `Flag '${flagId}' is not provisioned in environment '${environmentId}'`,
          detail: 'This feature flag is not configured for this environment.',
          context: { flagId, environmentId },
        });
      }

      return flagEnvironment;
    },

    exists: async (filters: FlagEnvironmentsListFilters) => {
      const result = await db
        .select({ flagId: flagEnvironments.flagId })
        .from(flagEnvironments)
        .where(buildConditions(filters))
        .limit(1);

      return !!result.length;
    },

    list: async (params: RepositoryListParams<FlagEnvironmentsListFilters, null, FlagEnvironmentsJoined>) => {
      const orderBy = getOrderByFromSort(SORTABLE_COLUMNS, 'updatedAt:asc', params.sort);
      const query = db
        .select(ALL_TABLE_COLUMNS)
        .from(flagEnvironments)
        .innerJoin(environments, eq(environments.id, flagEnvironments.environmentId))
        .innerJoin(featureFlags, eq(featureFlags.id, flagEnvironments.flagId))
        .leftJoin(flagVariations, eq(flagVariations.id, flagEnvironments.defaultServeId))
        .where(buildConditions(params.filters))
        .orderBy(orderBy)
        .$dynamic();

      return withPagination(query, params.pagination);
    },

    count: async (filters?: FlagEnvironmentsListFilters) => {
      const [result = { count: 0 }] = await db
        .select({ count: count() })
        .from(flagEnvironments)
        .innerJoin(environments, eq(environments.id, flagEnvironments.environmentId))
        .innerJoin(featureFlags, eq(featureFlags.id, flagEnvironments.flagId))
        .leftJoin(flagVariations, eq(flagVariations.id, flagEnvironments.defaultServeId))
        .where(buildConditions(filters));

      return result.count;
    },

    updateByFlagIdAndEnvironmentId: async (flagId: string, environmentId: string, payload: FlagEnvironmentsUpdate) => {
      const [updated] = await db
        .update(flagEnvironments)
        .set(payload)
        .where(and(eq(flagEnvironments.flagId, flagId), eq(flagEnvironments.environmentId, environmentId)))
        .returning();

      if (!updated) {
        throw new NotFoundError({
          message: `Flag '${flagId}' is not provisioned in environment '${environmentId}'`,
          detail: 'This feature flag is not configured for this environment.',
          context: { flagId, environmentId },
        });
      }

      return repository.getByFlagIdAndEnvironmentId(flagId, environmentId);
    },

    updateMany: async (payload: FlagEnvironmentsUpdateMany[]) => {
      if (!payload.length) {
        return [];
      }

      const results = await Promise.all(
        payload.map(({ flagId, environmentId, ...data }) =>
          db
            .update(flagEnvironments)
            .set(data)
            .where(and(eq(flagEnvironments.flagId, flagId), eq(flagEnvironments.environmentId, environmentId)))
            .returning(),
        ),
      );

      return results.flat();
    },
  };
  return repository;
}

function buildConditions(filters?: FlagEnvironmentsListFilters) {
  const andConditions = [];

  if (filters?.defaultServeIds?.length) {
    andConditions.push(inArray(flagEnvironments.defaultServeId, filters.defaultServeIds));
  }

  if (filters?.enabled !== undefined) {
    andConditions.push(eq(flagEnvironments.enabled, filters.enabled));
  }

  if (filters?.environmentIds?.length) {
    andConditions.push(inArray(flagEnvironments.environmentId, filters.environmentIds));
  }

  if (filters?.environmentKeys?.length) {
    andConditions.push(inArray(environments.key, filters.environmentKeys));
  }

  if (filters?.flagIds?.length) {
    andConditions.push(inArray(flagEnvironments.flagId, filters.flagIds));
  }

  return and(...andConditions);
}

export default createFlagEnvironmentsRepository;
