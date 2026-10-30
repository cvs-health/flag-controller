// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import type { QueryOptions } from '../../typings/api';
import getUsers from '../requests/getUsers';

export const getUsersQueryKey = 'getUsersQueryKey';

function useGetUsersQuery(options: QueryOptions<typeof getUsers> = {}) {
  return useQuery({
    ...options,
    queryKey: [getUsersQueryKey],
    queryFn: getUsers,
  });
}

export default useGetUsersQuery;
