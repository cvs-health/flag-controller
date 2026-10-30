// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { PgSelect } from 'drizzle-orm/pg-core';
import { PAGINATION_NO_LIMIT } from '../constants/pagination.js';
import type { RepositoryPaginationParams } from '../types/repositories.js';

function withPagination<T extends PgSelect>(query: T, pagination: RepositoryPaginationParams) {
  if (pagination.limit !== PAGINATION_NO_LIMIT) {
    query.limit(pagination.limit);
    query.offset(pagination.offset ?? 0);
  }
  return query;
}

export default withPagination;
