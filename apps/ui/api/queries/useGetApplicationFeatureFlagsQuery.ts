// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';
import type { ColumnSorting, Pagination, QueryOptions } from '../../typings/api';
import getApplicationFeatureFlags from '../requests/getApplicationFeatureFlags';

export const getApplicationFeatureFlagsKey = 'getApplicationFeatureFlagsKey';

function useGetApplicationFeatureFlagsQuery(
  applicationId: string,
  search: string,
  pagination: Pagination,
  summary = true,
  sort: ColumnSorting = 'key:asc',
  options: QueryOptions<typeof getApplicationFeatureFlags> = {},
) {
  return useQuery({
    ...options,
    queryKey: [getApplicationFeatureFlagsKey, applicationId, search, summary, sort, pagination],
    queryFn: () => getApplicationFeatureFlags(applicationId, pagination, search, summary, sort),
  });
}

export default useGetApplicationFeatureFlagsQuery;
