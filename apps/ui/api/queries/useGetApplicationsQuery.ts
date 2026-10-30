// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';
import type { Scope } from 'shared-types';

import type { Pagination, QueryOptions } from '../../typings/api';
import getApplications from '../requests/getApplications';

export const getApplicationsQueryKey = 'getApplicationsQueryKey';

function useGetApplicationsQuery(
  pagination: Pagination,
  scope: Scope,
  options: QueryOptions<typeof getApplications> = {},
) {
  return useQuery({
    ...options,
    queryKey: [getApplicationsQueryKey, pagination, scope],
    queryFn: () => getApplications(pagination, scope),
  });
}

export default useGetApplicationsQuery;
