// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';
import type { Pagination, QueryOptions } from '../../typings/api';
import getTeamApplications from '../requests/getTeamApplications';

export const getTeamApplicationsQueryKey = 'getTeamApplicationsQueryKey';

function useGetTeamApplicationsQuery(
  teamId: string,
  pagination: Pagination,
  options: QueryOptions<typeof getTeamApplications> = {},
) {
  return useQuery({
    ...options,
    queryKey: [getTeamApplicationsQueryKey, teamId, pagination],
    queryFn: () => getTeamApplications(teamId, pagination),
  });
}

export default useGetTeamApplicationsQuery;
