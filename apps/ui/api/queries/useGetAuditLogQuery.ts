// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Scope } from 'shared-types';

import type { ColumnSorting, Pagination, QueryOptions } from '../../typings/api';
import getAuditLog from '../requests/getAuditLog';

export const getAuditLogQueryKey = 'getAuditLogQueryKey';

function useGetAuditLogQuery(
  search: string,
  pagination: Pagination,
  sort: ColumnSorting,
  filter = '',
  scope: Scope = Scope.All,
  options: QueryOptions<typeof getAuditLog> = {},
) {
  return useQuery({
    ...options,
    placeholderData: keepPreviousData,
    queryKey: [getAuditLogQueryKey, search, pagination, sort, filter, scope],
    queryFn: () => getAuditLog(search, pagination, sort, filter, scope),
  });
}

export default useGetAuditLogQuery;
