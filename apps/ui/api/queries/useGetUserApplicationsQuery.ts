// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import type { QueryOptions } from '../../typings/api';
import getUserApplications from '../requests/getUserApplications';

export const getUserApplicationsQueryKey = 'getUserApplicationsQueryKey';

function useGetUserApplicationsQuery(userId: string, options: QueryOptions<typeof getUserApplications> = {}) {
  return useQuery({
    ...options,
    queryKey: [getUserApplicationsQueryKey, userId],
    queryFn: () => getUserApplications(userId),
  });
}

export default useGetUserApplicationsQuery;
