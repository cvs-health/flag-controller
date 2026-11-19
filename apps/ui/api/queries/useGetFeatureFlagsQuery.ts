// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Scope } from 'shared-types';

import type { ColumnSorting, Pagination, QueryOptions } from '../../typings/api';
import getFeatureFlags from '../requests/getFeatureFlags';

export const getFeatureFlagsQueryKey = 'getFeatureFlagsQueryKey';

function useGetFeatureFlagsQuery(
  search: string,
  pagination: Pagination,
  summary = true,
  sort: ColumnSorting = 'key:asc',
  filter = '',
  scope = Scope.Me,
  options: QueryOptions<typeof getFeatureFlags> = {},
) {
  return useQuery({
    ...options,
    placeholderData: keepPreviousData,
    queryKey: [getFeatureFlagsQueryKey, search, summary, sort, filter, scope, pagination],
    queryFn: () => getFeatureFlags(pagination, search, summary, sort, filter, scope),
  });
}

export default useGetFeatureFlagsQuery;
