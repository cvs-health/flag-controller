// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, count, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import type {
  CreateFeatureFlagRulePayload,
  CreateSegmentRulePayload,
  UpdateFeatureFlagRulePayload,
  UpdateSegmentRulePayload,
} from 'shared-types';

import getOrderByFromSort from 'utils/getOrderByFromSort.js';
import type { DbOrTx } from '../types/db.js';
import type { FractionalsSelect } from './fractionalsRepository.js';
import type { IncludeFilters } from '../types/common.js';
import type { RepositoryListParams } from '../types/repositories.js';
import withPagination from 'utils/withPagination.js';
import { InternalError, NotFoundError } from '../errors/AppError.js';
import { applications } from 'db/schema/applications.js';
import { environments } from 'db/schema/environments.js';
import { featureFlags } from 'db/schema/featureFlags.js';
import { flagVariations } from 'db/schema/flagVariations.js';
import { fractionals } from 'db/schema/fractionals.js';
import { rules } from 'db/schema/rules.js';
import { segments } from 'db/schema/segments.js';

export type RulesInsert = typeof rules.$inferInsert;
export type RulesSelect = typeof rules.$inferSelect;
export type RulesSelectJoined = typeof rules.$inferSelect & {
  flagKey: string | null;
  segmentKey: string | null;
  serveFractional: Pick<FractionalsSelect, 'id' | 'type' | 'var' | 'weights'> | null;
  serveVariationKey: string | null;
};
export type RulesCreate = CreateFeatureFlagRulePayload | CreateSegmentRulePayload;
export type RulesUpdate = UpdateFeatureFlagRulePayload | UpdateSegmentRulePayload;
export type RulesRepository = ReturnType<typeof createRulesRepository>;

export interface RulesFilters {
  environmentIds?: string[];
  flagIds?: string[];
  include?: IncludeFilters;
  keys?: string[];
  segmentIds?: string[];
  serveIds?: string[];
  serveFractionalIds?: string[];
}

export type RulesListItem = Awaited<ReturnType<ReturnType<typeof createRulesRepository>['list']>>[0];

const RULES_TABLE_COLUMNS = {
  conditions: rules.conditions,
  createdAt: rules.createdAt,
  deletedAt: rules.deletedAt,
  environmentId: rules.environmentId,
  flagId: rules.flagId,
  id: rules.id,
  key: rules.key,
  orderPosition: rules.orderPosition,
  segmentId: rules.segmentId,
  serveFractionalId: rules.serveFractionalId,
  serveVariationId: rules.serveVariationId,
  updatedAt: rules.updatedAt,
};
const RULES_TABLE_COLUMNS_JOINED = {
  ...RULES_TABLE_COLUMNS,
  flagKey: featureFlags.key,
  segmentKey: segments.key,
  serveVariationKey: flagVariations.key,
  serveFractional: {
    id: fractionals.id,
    type: fractionals.type,
    var: fractionals.var,
    weights: fractionals.weights,
  },
};

function createRulesRepository(db: DbOrTx) {
  const repository = {
    findOwningTeamId: async (id: string): Promise<string | null> => {
      const [row = null] = await db
        .select({ teamId: applications.teamId })
        .from(rules)
        .innerJoin(environments, eq(rules.environmentId, environments.id))
        .innerJoin(applications, eq(environments.applicationId, applications.id))
        .where(eq(rules.id, id))
        .limit(1);

      return row?.teamId ?? null;
    },

    create: async (payload: RulesCreate) => {
      const [rule] = await db.insert(rules).values(payload).returning();

      if (!rule) {
        throw new InternalError({ message: 'Insert returned no rule row' });
      }

      return repository.getById(rule.id);
    },

    exists: async (filters: RulesFilters) => {
      const conditions = buildListConditions(filters);
      const result = await db.select(RULES_TABLE_COLUMNS).from(rules).where(conditions).limit(1);

      return !!result.length;
    },

    findById: async (id: string) => {
      const [rule = null] = await db
        .select(RULES_TABLE_COLUMNS_JOINED)
        .from(rules)
        .leftJoin(featureFlags, eq(rules.flagId, featureFlags.id))
        .leftJoin(segments, eq(rules.segmentId, segments.id))
        .leftJoin(flagVariations, eq(rules.serveVariationId, flagVariations.id))
        .leftJoin(fractionals, and(eq(rules.serveFractionalId, fractionals.id), isNull(fractionals.deletedAt)))
        .where(eq(rules.id, id))
        .limit(1);

      return rule;
    },

    getById: async (id: string) => {
      const rule = await repository.findById(id);

      if (!rule) {
        throw new NotFoundError({ message: 'Rule not found', detail: 'Rule not found.', context: { id } });
      }

      return rule;
    },

    list: async (params: RepositoryListParams<RulesFilters>) => {
      const conditions = buildListConditions(params.filters);
      const orderBy = getOrderByFromSort(rules, 'orderPosition:asc', params.sort);
      const query = db
        .select(RULES_TABLE_COLUMNS_JOINED)
        .from(rules)
        .leftJoin(featureFlags, eq(rules.flagId, featureFlags.id))
        .leftJoin(segments, eq(rules.segmentId, segments.id))
        .leftJoin(flagVariations, eq(rules.serveVariationId, flagVariations.id))
        .leftJoin(fractionals, and(eq(rules.serveFractionalId, fractionals.id), isNull(fractionals.deletedAt)))
        .where(conditions)
        .orderBy(orderBy)
        .$dynamic();

      withPagination(query, params.pagination);

      return query;
    },

    count: async (filters?: RulesFilters) => {
      const conditions = buildListConditions(filters);
      const [result = { count: 0 }] = await db.select({ count: count() }).from(rules).where(conditions);

      return result.count;
    },

    updateById: async (id: string, payload: Omit<RulesUpdate, 'id'>) => {
      const [rule] = await db.update(rules).set(payload).where(eq(rules.id, id)).returning();

      if (!rule) {
        throw new NotFoundError({ message: 'Rule not found', detail: 'Rule not found.', context: { id } });
      }

      return repository.getById(rule.id);
    },

    createMany: async (data: RulesCreate[]) => {
      if (!data.length) {
        return [];
      }

      const result = await Promise.all(data.map((item) => repository.create(item)));

      return result;
    },

    updateMany: async (payload: RulesUpdate[]) => {
      if (!payload.length) {
        return [];
      }

      const results = await Promise.all(
        payload.map(({ id, ...data }) => db.update(rules).set(data).where(eq(rules.id, id)).returning()),
      );

      return results.flat();
    },

    /**
     * Hard deletes multiple rules by their IDs.
     * This operation should only be used with db transactions to avoid divergence.
     */
    hardDeleteMany: async (ids: string[]) => {
      if (!ids.length) {
        return [];
      }

      const deleted = await db
        .select(RULES_TABLE_COLUMNS_JOINED)
        .from(rules)
        .leftJoin(featureFlags, eq(rules.flagId, featureFlags.id))
        .leftJoin(segments, eq(rules.segmentId, segments.id))
        .leftJoin(flagVariations, eq(rules.serveVariationId, flagVariations.id))
        .leftJoin(fractionals, and(eq(rules.serveFractionalId, fractionals.id), isNull(fractionals.deletedAt)))
        .where(inArray(rules.id, ids))
        .for('update', { of: rules });

      await db.delete(rules).where(inArray(rules.id, ids));

      return deleted;
    },

    softDeleteMany: async (ids: string[]) => {
      if (!ids.length) {
        return [];
      }

      const deleted = await db
        .select(RULES_TABLE_COLUMNS_JOINED)
        .from(rules)
        .leftJoin(featureFlags, eq(rules.flagId, featureFlags.id))
        .leftJoin(segments, eq(rules.segmentId, segments.id))
        .leftJoin(flagVariations, eq(rules.serveVariationId, flagVariations.id))
        .leftJoin(fractionals, and(eq(rules.serveFractionalId, fractionals.id), isNull(fractionals.deletedAt)))
        .where(inArray(rules.id, ids))
        .for('update', { of: rules });

      await db.update(rules).set({ deletedAt: sql`now()` }).where(inArray(rules.id, ids));

      return deleted;
    },
  };

  return repository;
}

function buildListConditions(filters?: RulesFilters) {
  const orConditions = [];
  const andConditions = [];

  if (!filters) {
    return and(isNull(rules.deletedAt));
  }

  if (!filters.include?.deleted) {
    andConditions.push(isNull(rules.deletedAt));
  }

  if (filters.flagIds?.length) {
    andConditions.push(inArray(rules.flagId, filters.flagIds));
  }

  if (filters.serveIds?.length) {
    orConditions.push(inArray(rules.serveFractionalId, filters.serveIds));
    orConditions.push(inArray(rules.serveVariationId, filters.serveIds));
  }

  if (filters.serveFractionalIds?.length) {
    andConditions.push(inArray(rules.serveFractionalId, filters.serveFractionalIds));
  }

  if (filters.segmentIds?.length) {
    andConditions.push(inArray(rules.segmentId, filters.segmentIds));
  }

  if (filters.keys?.length) {
    andConditions.push(inArray(rules.key, filters.keys));
  }

  if (filters.environmentIds?.length) {
    andConditions.push(inArray(rules.environmentId, filters.environmentIds));
  }

  return orConditions.length ? and(...andConditions, or(...orConditions)) : and(...andConditions);
}

export default createRulesRepository;
