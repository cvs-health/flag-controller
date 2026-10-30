// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import dbLogToApiSchema from 'utils/dbLogToApiSchema.js';
import listParamsSortToString from 'utils/listParamsSortToString.js';
import type { LogsListFilters } from 'repositories/logsRepository.js';
import type { ServiceDependencies, ServiceListParams } from '../types/services.js';
import type { logs } from 'db/schema/logs.js';

export type LogsService = ReturnType<typeof createLogsService>;

function createLogsService({ repositories }: ServiceDependencies) {
  return {
    listLogs: async (params: ServiceListParams<typeof logs.$inferSelect, LogsListFilters, never>) => {
      const sort = listParamsSortToString(params.sort.field, params.sort.direction);
      const [logsResult, count] = await Promise.all([
        repositories.logsRepository.list({
          filters: params.filters,
          pagination: {
            limit: params.pagination.rows,
            offset: (params.pagination.page - 1) * params.pagination.rows,
          },
          sort: {
            field: params.sort.field,
            direction: params.sort.direction,
          },
        }),
        repositories.logsRepository.count(params.filters),
      ]);

      const data = logsResult.map(dbLogToApiSchema);

      return {
        data,
        metadata: {
          page: params.pagination.page,
          records: data.length,
          rows: params.pagination.rows,
          search: params.filters?.and?.search || '',
          sort,
          totalPages: params.pagination.rows > 0 ? Math.ceil(count / params.pagination.rows) : 0,
          totalRecords: count,
        },
      };
    },
  };
}

export default createLogsService;
