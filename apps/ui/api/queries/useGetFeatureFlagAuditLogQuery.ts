// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { ColumnSorting, Pagination, QueryOptions } from '../../typings/api';
import getFeatureFlagAuditLog from '../requests/getFeatureFlagAuditLog';

export const getFeatureFlagAuditLogQueryKey = 'getFeatureFlagAuditLogQueryKey';

function useGetFeatureFlagAuditLogQuery(
  featureFlagId: string,
  pagination: Pagination,
  sort: ColumnSorting,
  options: QueryOptions<typeof getFeatureFlagAuditLog> = {},
) {
  return useQuery({
    ...options,
    placeholderData: keepPreviousData,
    queryKey: [getFeatureFlagAuditLogQueryKey, featureFlagId, pagination, sort],
    queryFn: () => getFeatureFlagAuditLog(featureFlagId, pagination, sort),
  });
}

export default useGetFeatureFlagAuditLogQuery;
