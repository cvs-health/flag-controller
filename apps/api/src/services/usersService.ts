// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import buildListResult from 'utils/buildListResult.js';
import type { ServiceDependencies, ServiceListParams } from '../types/services.js';
import type { users } from 'db/schema/auth.js';
import type { ListUsersFilters } from 'repositories/usersRepository.js';

export type UsersService = ReturnType<typeof createUsersService>;

function createUsersService({ repositories }: ServiceDependencies) {
  return {
    listUsers: async (params: ServiceListParams<typeof users.$inferSelect, ListUsersFilters>) => {
      const [usersResult, countResult] = await Promise.all([
        repositories.usersRepository.list({
          filters: params.filters,
          pagination: {
            limit: params.pagination.rows,
            offset: (params.pagination.page - 1) * params.pagination.rows,
          },
          sort: {
            direction: params.sort.direction,
            field: params.sort.field,
          },
        }),
        repositories.usersRepository.count(params.filters ? { filters: params.filters } : undefined),
      ]);

      return buildListResult(usersResult, countResult, { page: params.pagination.page, rows: params.pagination.rows });
    },
  };
}

export default createUsersService;
