// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Scope } from 'shared-types';

import type { ColumnSorting, Pagination, QueryOptions } from '../../typings/api';
import getSegments from '../requests/getSegments';

export const getSegmentsKey = 'getSegmentsKey';

function useGetSegmentsQuery(
  search: string,
  pagination: Pagination,
  sort: ColumnSorting = 'updatedAt:desc',
  scope: Scope = Scope.All,
  options: QueryOptions<typeof getSegments> = {},
) {
  return useQuery({
    ...options,
    placeholderData: keepPreviousData,
    queryKey: [getSegmentsKey, search, pagination, sort, scope],
    queryFn: () => getSegments(pagination, search, sort, scope),
  });
}

export default useGetSegmentsQuery;
