// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';
import type { QueryOptions } from '../../typings/api';
import getApplicationEnvironmentSegmentRules from '../requests/getApplicationEnvironmentSegmentRules';

export const getApplicationEnvironmentSegmentRulesKey = 'getApplicationEnvironmentSegmentRulesKey';

function useGetApplicationEnvironmentSegmentRulesQuery(
  applicationName: string,
  environmentKey: string,
  segmentKey: string,
  options: QueryOptions<typeof getApplicationEnvironmentSegmentRules> = {},
) {
  return useQuery({
    ...options,
    queryKey: [getApplicationEnvironmentSegmentRulesKey, applicationName, environmentKey, segmentKey],
    queryFn: () => getApplicationEnvironmentSegmentRules(applicationName, environmentKey, segmentKey),
  });
}

export default useGetApplicationEnvironmentSegmentRulesQuery;
