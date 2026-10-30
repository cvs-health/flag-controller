// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, inArray, count, eq } from 'drizzle-orm';
import type { DbOrTx } from '../types/db.js';
import type { RepositoryListParams } from '../types/repositories.js';

import { teamMembers, users } from 'db/schema/auth.js';
import withPagination from 'utils/withPagination.js';
import getOrderByFromSort from 'utils/getOrderByFromSort.js';

const USERS_TABLE_COLUMNS = {
  createdAt: users.createdAt,
  email: users.email,
  id: users.id,
  name: users.name,
  updatedAt: users.updatedAt,
};

export type ListUsersFilters = {
  teamIds?: string[];
  userIds?: string[];
};
export type UsersRepository = ReturnType<typeof createUsersRepository>;

function buildListConditions(filters?: ListUsersFilters) {
  const conditions = [];

  if (filters?.userIds?.length) {
    conditions.push(inArray(users.id, filters.userIds));
  }

  if (filters?.teamIds?.length) {
    conditions.push(inArray(teamMembers.teamId, filters.teamIds));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function createUsersRepository(db: DbOrTx) {
  return {
    list: async (params: RepositoryListParams<ListUsersFilters>) => {
      const whereCondition = buildListConditions(params.filters);
      const orderBy = getOrderByFromSort(users, 'updatedAt:asc', params.sort);

      const baseQuery = db.select(USERS_TABLE_COLUMNS).from(users).where(whereCondition).orderBy(orderBy).$dynamic();

      const query = params.filters?.teamIds?.length
        ? baseQuery.innerJoin(teamMembers, eq(users.id, teamMembers.userId))
        : baseQuery;

      withPagination(query, params.pagination);

      return await query;
    },
    count: async (params?: Omit<RepositoryListParams<ListUsersFilters>, 'pagination'>) => {
      const whereCondition = buildListConditions(params?.filters);
      const baseQuery = db.select({ count: count() }).from(users).where(whereCondition);

      const query = params?.filters?.teamIds?.length
        ? baseQuery.innerJoin(teamMembers, eq(users.id, teamMembers.userId))
        : baseQuery;

      const [result = { count: 0 }] = await query;

      return result.count;
    },
  };
}

export default createUsersRepository;
