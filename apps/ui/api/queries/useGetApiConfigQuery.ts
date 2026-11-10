// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import type { QueryOptions } from '../../typings/api';
import getApiConfig from '../requests/getApiConfig';

export const getApiConfigQueryKey = 'getApiConfigQueryKey';

function useGetApiConfigQuery(options: QueryOptions<typeof getApiConfig> = {}) {
  return useQuery({
    ...options,
    queryKey: [getApiConfigQueryKey],
    queryFn: getApiConfig,
  });
}

export default useGetApiConfigQuery;
