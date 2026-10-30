// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';
import type { QueryOptions } from '../../typings/api';
import getApplication from '../requests/getApplication';

export const getApplicationQueryKey = 'getApplicationQueryKey';

function useGetApplicationQuery(applicationName: string, options: QueryOptions<typeof getApplication> = {}) {
  return useQuery({
    ...options,
    queryKey: [getApplicationQueryKey, applicationName],
    queryFn: () => getApplication(applicationName),
  });
}

export default useGetApplicationQuery;
