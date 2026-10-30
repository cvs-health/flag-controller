// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import type { Pagination, QueryOptions } from '../../typings/api';
import getTeamMembers from '../requests/getTeamMembers';

export const getTeamMembersQueryKey = 'getTeamMembersQueryKey';

function useGetTeamMembersQuery(
  teamId: string,
  pagination: Pagination,
  options: QueryOptions<typeof getTeamMembers> = {},
) {
  return useQuery({
    ...options,
    queryKey: [getTeamMembersQueryKey, teamId, pagination],
    queryFn: () => getTeamMembers(teamId, pagination),
  });
}

export default useGetTeamMembersQuery;
