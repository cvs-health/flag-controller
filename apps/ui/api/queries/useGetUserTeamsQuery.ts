// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import type { QueryOptions } from '../../typings/api';
import getUserTeams from '../requests/getUserTeams';

export const getUserTeamsQueryKey = 'getUserTeamsQueryKey';

function useGetUserTeamsQuery(userId: string, options: QueryOptions<typeof getUserTeams> = {}) {
  return useQuery({
    ...options,
    queryKey: [getUserTeamsQueryKey, userId],
    queryFn: () => getUserTeams(userId),
  });
}

export default useGetUserTeamsQuery;
