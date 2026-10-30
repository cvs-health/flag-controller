// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { ColumnSorting, Pagination, QueryOptions } from '../../typings/api';
import getTeamAuditLog from '../requests/getTeamAuditLog';

export const getTeamAuditLogQueryKey = 'getTeamAuditLogQueryKey';

function useGetTeamAuditLogQuery(
  teamId: string,
  search: string,
  pagination: Pagination,
  sort: ColumnSorting,
  options: QueryOptions<typeof getTeamAuditLog> = {},
) {
  return useQuery({
    ...options,
    placeholderData: keepPreviousData,
    queryKey: [getTeamAuditLogQueryKey, teamId, search, pagination, sort],
    queryFn: () => getTeamAuditLog(teamId, search, pagination, sort),
  });
}

export default useGetTeamAuditLogQuery;
