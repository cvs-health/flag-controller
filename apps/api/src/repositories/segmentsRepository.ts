// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, count, countDistinct, eq, ilike, inArray, isNull, sql, type SQLWrapper } from 'drizzle-orm';

import { applications } from 'db/schema/applications.js';
import { rules } from 'db/schema/rules.js';
import { segments } from 'db/schema/segments.js';
import getOrderByFromSort from 'utils/getOrderByFromSort.js';
import { isUniqueViolation } from 'utils/pgErrors.js';
import withPagination from 'utils/withPagination.js';
import { FieldErrorCode } from 'shared-types';
import type { IncludeFilters, With } from '../types/common.js';
import type { DbOrTx } from '../types/db.js';
import type { RepositoryListParams } from '../types/repositories.js';
import { ConflictError, InternalError, NotFoundError } from '../errors/AppError.js';

export interface SegmentsListWith extends With {
  flagTargetCount: boolean;
}

export type SegmentsSelect = typeof segments.$inferSelect;
export type SegmentsInsert = typeof segments.$inferInsert;
export type SegmentsCreate = Pick<SegmentsInsert, 'applicationId' | 'key' | 'description'>;
export type SegmentsUpdate = Partial<SegmentsCreate>;
export type SegmentsFilters = {
  applicationIds?: string[];
  segmentIds?: string[];
  include?: IncludeFilters;
  search?: string;
};
export type SegmentsRepository = ReturnType<typeof createSegmentsRepository>;

const ALL_TABLE_COLUMNS = {
  applicationId: segments.applicationId,
  createdAt: segments.createdAt,
  deletedAt: segments.deletedAt,
  description: segments.description,
  id: segments.id,
  key: segments.key,
  updatedAt: segments.updatedAt,
};
const TABLE_COLUMNS_JOINED = {
  ...ALL_TABLE_COLUMNS,
  applicationName: applications.name,
};

function createSegmentsRepository(db: DbOrTx) {
  const repository = {
    findOwningTeamId: async (id: string) => {
      const [row = null] = await db
        .select({ teamId: applications.teamId })
        .from(segments)
        .innerJoin(applications, eq(segments.applicationId, applications.id))
        .where(eq(segments.id, id))
        .limit(1);

      return row?.teamId ?? null;
    },

    create: async (payload: SegmentsCreate) => {
      const [segment] = await db.insert(segments).values(payload).returning();

      if (!segment) {
        throw new InternalError({ message: 'Insert returned no segment row' });
      }

      return segment;
    },
    createMany: async (payloads: SegmentsCreate[]) => {
      if (!payloads.length) {
        return [];
      }

      try {
        return await db.insert(segments).values(payloads).returning();
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new ConflictError({
            message: 'Segment with this key already exists',
            detail: 'A segment with this key already exists for this application.',
            errors: [{ field: 'key', code: FieldErrorCode.Duplicate }],
            cause: error,
          });
        }

        throw error;
      }
    },
    list: async (params: RepositoryListParams<SegmentsFilters, SegmentsListWith, SegmentsSelect>) => {
      const conditions = buildListConditions(params.filters);
      const orderBy = getOrderByFromSort(segments, 'updatedAt:desc', params.sort);

      if (params.with?.flagTargetCount) {
        const segmentIdFromCondition = sql`cond->>'segmentId'`;
        const flagCounts = db.$with('flag_counts').as(
          db
            .select({
              segmentId: segmentIdFromCondition.as('segment_id'),
              flagCount: countDistinct(rules.flagId).as('flag_count'),
            })
            .from(rules)
            .crossJoin(sql`jsonb_array_elements(${rules.conditions}) AS cond`)
            .where(isNull(rules.deletedAt))
            .groupBy(sql`cond->>'segmentId'`),
        );
        const query = db
          .with(flagCounts)
          .select({
            flagTargetCount: sql<number>`COALESCE(${flagCounts.flagCount}, 0)`.as('flag_target_count'),
            ...TABLE_COLUMNS_JOINED,
          })
          .from(segments)
          .innerJoin(applications, eq(segments.applicationId, applications.id))
          .leftJoin(flagCounts, eq(flagCounts.segmentId, segments.id))
          .where(conditions)
          .orderBy(orderBy)
          .$dynamic();

        return withPagination(query, params.pagination);
      }
      const query = db
        .select(TABLE_COLUMNS_JOINED)
        .from(segments)
        .innerJoin(applications, eq(segments.applicationId, applications.id))
        .where(conditions)
        .orderBy(orderBy)
        .$dynamic();

      return withPagination(query, params.pagination);
    },

    count: async (params?: Omit<RepositoryListParams<SegmentsFilters>, 'pagination'>) => {
      const conditions = buildListConditions(params?.filters);
      const [result = { count: 0 }] = await db.select({ count: count() }).from(segments).where(conditions);

      return result.count;
    },
    exists: async (filters: SegmentsFilters) => {
      const conditions = buildListConditions(filters);
      const result = await db.select({ id: segments.id }).from(segments).where(conditions).limit(1);

      return !!result.length;
    },

    findByApplicationNameAndKey: async (applicationName: string, segmentKey: string) => {
      const [segment = null] = await db
        .select(TABLE_COLUMNS_JOINED)
        .from(segments)
        .innerJoin(applications, eq(segments.applicationId, applications.id))
        .where(and(eq(applications.name, applicationName), eq(segments.key, segmentKey)))
        .limit(1);

      return segment;
    },

    findById: async (id: string) => {
      const [segment = null] = await db
        .select(TABLE_COLUMNS_JOINED)
        .from(segments)
        .innerJoin(applications, eq(segments.applicationId, applications.id))
        .where(eq(segments.id, id))
        .limit(1);

      return segment;
    },

    findByKey: async (applicationId: string, segmentKey: string) => {
      const [segment = null] = await db
        .select(TABLE_COLUMNS_JOINED)
        .from(segments)
        .innerJoin(applications, eq(segments.applicationId, applications.id))
        .where(and(eq(segments.applicationId, applicationId), eq(segments.key, segmentKey)))
        .limit(1);

      return segment;
    },

    getById: async (id: string) => {
      const segment = await repository.findById(id);

      if (!segment) {
        throw new NotFoundError({ message: 'Segment not found', detail: 'Segment not found.', context: { id } });
      }

      return segment;
    },

    getByApplicationNameAndKey: async (applicationName: string, segmentKey: string) => {
      const segment = await repository.findByApplicationNameAndKey(applicationName, segmentKey);

      if (!segment) {
        throw new NotFoundError({
          message: 'Segment not found',
          detail: 'Segment not found.',
          context: { applicationName, segmentKey },
        });
      }

      return segment;
    },

    updateById: async (id: string, payload: SegmentsUpdate) => {
      const [updated = null] = await db.update(segments).set(payload).where(eq(segments.id, id)).returning();

      return updated;
    },

    softDeleteMany: async (ids: string[]) => {
      if (!ids.length) {
        return [];
      }

      const deleted = await db
        .select(TABLE_COLUMNS_JOINED)
        .from(segments)
        .innerJoin(applications, eq(segments.applicationId, applications.id))
        .where(inArray(segments.id, ids))
        .for('update', { of: segments });

      await db.update(segments).set({ deletedAt: sql`now()` }).where(inArray(segments.id, ids));

      return deleted;
    },
  };

  return repository;
}

function buildListConditions(filters?: SegmentsFilters) {
  const conditions: SQLWrapper[] = [];

  if (!filters?.include?.deleted) {
    conditions.push(isNull(segments.deletedAt));
  }

  if (filters?.applicationIds?.length) {
    conditions.push(inArray(segments.applicationId, filters.applicationIds));
  }

  if (filters?.segmentIds?.length) {
    conditions.push(inArray(segments.id, filters.segmentIds));
  }

  if (filters?.search) {
    conditions.push(ilike(segments.key, `%${filters.search}%`));
  }

  return conditions.length ? and(...conditions) : undefined;
}

export default createSegmentsRepository;
