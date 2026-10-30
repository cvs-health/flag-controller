// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { ColumnSorting, Pagination, QueryOptions } from '../../typings/api';
import getApplicationAuditLog from '../requests/getApplicationAuditLog';

export const getApplicationAuditLogQueryKey = 'getApplicationAuditLogQueryKey';

function useGetApplicationAuditLogQuery(
  applicationId: string,
  pagination: Pagination,
  sort: ColumnSorting,
  options: QueryOptions<typeof getApplicationAuditLog> = {},
) {
  return useQuery({
    ...options,
    placeholderData: keepPreviousData,
    queryKey: [getApplicationAuditLogQueryKey, applicationId, pagination, sort],
    queryFn: () => getApplicationAuditLog(applicationId, pagination, sort),
  });
}

export default useGetApplicationAuditLogQuery;
