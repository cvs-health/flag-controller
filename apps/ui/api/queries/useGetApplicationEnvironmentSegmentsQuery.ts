// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';
import type { QueryOptions } from '../../typings/api';
import getApplicationEnvironmentSegments from '../requests/getApplicationEnvironmentSegments';

export const getApplicationEnvironmentSegmentsKey = 'getApplicationEnvironmentSegmentsKey';

function useGetApplicationEnvironmentSegmentsQuery(
  applicationName: string,
  environmentKey: string,
  definedConditions = false,
  options: QueryOptions<typeof getApplicationEnvironmentSegments> = {},
) {
  return useQuery({
    ...options,
    queryKey: [getApplicationEnvironmentSegmentsKey, applicationName, environmentKey, definedConditions],
    queryFn: () => getApplicationEnvironmentSegments(applicationName, environmentKey, definedConditions),
  });
}

export default useGetApplicationEnvironmentSegmentsQuery;
