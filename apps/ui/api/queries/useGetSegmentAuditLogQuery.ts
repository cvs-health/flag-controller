// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { ColumnSorting, Pagination, QueryOptions } from '../../typings/api';
import getSegmentAuditLog from '../requests/getSegmentAuditLog';

export const getSegmentAuditLogKey = 'getSegmentAuditLogKey';

function useGetSegmentAuditLogQuery(
  segmentId: string,
  pagination: Pagination,
  sort: ColumnSorting,
  options: QueryOptions<typeof getSegmentAuditLog> = {},
) {
  return useQuery({
    ...options,
    placeholderData: keepPreviousData,
    queryKey: [getSegmentAuditLogKey, segmentId, pagination, sort],
    queryFn: () => getSegmentAuditLog(segmentId, pagination, sort),
  });
}

export default useGetSegmentAuditLogQuery;
