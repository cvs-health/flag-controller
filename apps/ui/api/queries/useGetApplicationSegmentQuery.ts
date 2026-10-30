// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import type { QueryOptions } from '../../typings/api';
import getApplicationSegment from '../requests/getApplicationSegment';

export const getApplicationSegmentKey = 'getApplicationSegmentKey';

function useGetApplicationSegmentQuery(
  applicationName: string,
  segmentKey: string,
  options: QueryOptions<typeof getApplicationSegment> = {},
) {
  return useQuery({
    ...options,
    queryKey: [getApplicationSegmentKey, applicationName, segmentKey],
    queryFn: () => getApplicationSegment(applicationName, segmentKey),
  });
}

export default useGetApplicationSegmentQuery;
