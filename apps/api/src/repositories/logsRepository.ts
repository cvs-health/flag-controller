// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, count, countDistinct, eq, gte, ilike, inArray, lte, or, type SQL, type SQLWrapper } from 'drizzle-orm';
import type { ActionType, SubjectType } from 'shared-types';

import getOrderByFromSort from 'utils/getOrderByFromSort.js';
import type { DbOrTx } from '../types/db.js';
import type { FilterGroup, RepositoryListParams } from '../types/repositories.js';
import withPagination from 'utils/withPagination.js';
import { InternalError } from '../errors/AppError.js';
import { applications } from 'db/schema/applications.js';
import { environments } from 'db/schema/environments.js';
import { logs } from 'db/schema/logs.js';
import { users } from 'db/schema/auth.js';

export type LogInsert = typeof logs.$inferInsert;
export type LogSelect = typeof logs.$inferSelect;
export type LogsRepository = ReturnType<typeof createLogsRepository>;

export interface LogsFilterFields {
  actionEndDate?: string;
  actionStartDate?: string;
  actionTypes?: ActionType[];
  applicationIds?: string[];
  environmentIds?: string[];
  subjectIds?: string[];
  subjectKeys?: string[];
  subjectTypes?: SubjectType[];
  search?: string;
}

export type LogsListFilters = FilterGroup<LogsFilterFields>;

const ALL_TABLE_COLUMNS = {
  action: logs.action,
  actorId: logs.actorId,
  applicationId: logs.applicationId,
  createdAt: logs.createdAt,
  environmentId: logs.environmentId,
  id: logs.id,
  newData: logs.newData,
  oldData: logs.oldData,
  subjectId: logs.subjectId,
  subjectKey: logs.subjectKey,
  subjectType: logs.subjectType,
};

function createLogsRepository(db: DbOrTx) {
  return {
    create: async (payload: LogInsert): Promise<LogSelect> => {
      const [inserted] = await db.insert(logs).values(payload).returning(ALL_TABLE_COLUMNS);

      if (!inserted) {
        throw new InternalError({ message: 'Insert returned no log row' });
      }

      return inserted;
    },
    createMany: async (entries: LogInsert[]): Promise<LogSelect[]> => {
      if (entries.length === 0) return [];

      return await db.insert(logs).values(entries).returning(ALL_TABLE_COLUMNS);
    },

    count: async (filters?: LogsListFilters) => {
      const conditions = buildListConditions(filters);
      const [result = { count: 0 }] = await db.select({ count: count() }).from(logs).where(conditions);

      return result.count;
    },

    countDistinct: async (column: SQLWrapper, filters?: LogsListFilters) => {
      const conditions = buildListConditions(filters);
      const [result = { count: 0 }] = await db
        .select({ count: countDistinct(column) })
        .from(logs)
        .where(conditions);

      return result.count;
    },

    list: async (params: RepositoryListParams<LogsListFilters, null, typeof logs.$inferSelect>) => {
      const whereConditions = buildListConditions(params.filters);
      const orderBy = getOrderByFromSort(logs, 'createdAt:asc', params.sort);
      const query = db
        .select({
          ...ALL_TABLE_COLUMNS,
          applicationName: applications.name,
          environmentKey: environments.key,
          actorEmail: users.email,
        })
        .from(logs)
        .leftJoin(applications, eq(logs.applicationId, applications.id))
        .leftJoin(environments, eq(logs.environmentId, environments.id))
        .leftJoin(users, eq(logs.actorId, users.id))
        .where(whereConditions)
        .orderBy(orderBy)
        .$dynamic();

      withPagination(query, params.pagination);

      return query;
    },
  };
}

/**
 * Builds the conditions for the query based on the querystring parameters.
 */
function buildListConditions(filters?: LogsListFilters): SQL | undefined {
  const andConditions = [];

  if (filters) {
    if (filters.and) {
      if (filters.and.applicationIds?.length) {
        andConditions.push(inArray(logs.applicationId, filters.and.applicationIds));
      }

      if (filters.and.subjectIds?.length) {
        andConditions.push(inArray(logs.subjectId, filters.and.subjectIds));
      }

      if (filters.and.subjectKeys?.length) {
        andConditions.push(inArray(logs.subjectKey, filters.and.subjectKeys));
      }

      if (filters.and.subjectTypes?.length) {
        andConditions.push(inArray(logs.subjectType, filters.and.subjectTypes));
      }

      if (filters.and.environmentIds?.length) {
        andConditions.push(inArray(logs.environmentId, filters.and.environmentIds));
      }

      if (filters.and.search) {
        const formattedSearch = `%${filters.and.search}%`;

        andConditions.push(ilike(logs.subjectKey, formattedSearch));
      }

      if (filters.and.actionStartDate) {
        andConditions.push(gte(logs.createdAt, new Date(filters.and.actionStartDate)));
      }

      if (filters.and.actionEndDate) {
        andConditions.push(lte(logs.createdAt, new Date(filters.and.actionEndDate)));
      }

      if (filters.and.actionTypes?.length) {
        andConditions.push(inArray(logs.action, filters.and.actionTypes));
      }
    }

    if (filters.or?.length) {
      const orConditions = filters.or.map((orFilter) => buildListConditions({ and: orFilter }));

      andConditions.push(or(...orConditions));
    }
  }

  return and(...andConditions);
}

export default createLogsRepository;
