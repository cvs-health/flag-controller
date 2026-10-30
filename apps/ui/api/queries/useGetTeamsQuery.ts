// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import type { Pagination, QueryOptions } from '../../typings/api';
import getTeams from '../requests/getTeams';

export const getTeamsQueryKey = 'getTeamsQueryKey';

function useGetTeamsQuery(pagination: Pagination, options: QueryOptions<typeof getTeams> = {}) {
  return useQuery({
    ...options,
    queryKey: [getTeamsQueryKey, pagination],
    queryFn: () => getTeams(pagination),
  });
}

export default useGetTeamsQuery;
