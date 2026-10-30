// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';
import type { TeamsTableColumns } from 'shared-types';

import type { QueryOptions } from '../../typings/api';
import { authClient } from '../../lib/auth-client';

export const getOrganizationTeamMembersQueryKey = 'getOrganizationTeamMembersQueryKey';

function useGetOrganizationTeamMembersQuery(
  teamId: string,
  options: QueryOptions<Pick<TeamsTableColumns, 'id'>[]> = {},
) {
  return useQuery({
    ...options,
    queryKey: [getOrganizationTeamMembersQueryKey, teamId],
    queryFn: () => authClient.organization.listTeamMembers({ query: { teamId }, fetchOptions: { throw: true } }),
  });
}

export default useGetOrganizationTeamMembersQuery;
