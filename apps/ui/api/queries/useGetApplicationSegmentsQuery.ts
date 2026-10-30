// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';
import type { ColumnSorting, Pagination, QueryOptions } from '../../typings/api';
import getApplicationSegments from '../requests/getApplicationSegments';

export const getApplicationSegmentsKey = 'getApplicationSegmentsKey';

function useGetApplicationSegmentsQuery(
  applicationId: string,
  search: string,
  pagination: Pagination,
  sort: ColumnSorting = 'updatedAt:desc',
  options: QueryOptions<typeof getApplicationSegments> = {},
) {
  return useQuery({
    ...options,
    queryKey: [getApplicationSegmentsKey, applicationId, search, pagination, sort],
    queryFn: () => getApplicationSegments(applicationId, pagination, search, sort),
  });
}

export default useGetApplicationSegmentsQuery;
