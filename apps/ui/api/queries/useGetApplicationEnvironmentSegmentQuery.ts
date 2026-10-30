// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import type { QueryOptions } from '../../typings/api';
import getApplicationEnvironmentSegment from '../requests/getApplicationEnvironmentSegment';

export const getApplicationEnvironmentSegmentKey = 'getApplicationEnvironmentSegmentKey';

function useGetApplicationEnvironmentSegmentQuery(
  applicationName: string,
  environmentKey: string,
  segmentKey: string,
  options: QueryOptions<typeof getApplicationEnvironmentSegment> = {},
) {
  return useQuery({
    ...options,
    queryKey: [getApplicationEnvironmentSegmentKey, applicationName, environmentKey, segmentKey],
    queryFn: () => getApplicationEnvironmentSegment(applicationName, environmentKey, segmentKey),
  });
}

export default useGetApplicationEnvironmentSegmentQuery;
