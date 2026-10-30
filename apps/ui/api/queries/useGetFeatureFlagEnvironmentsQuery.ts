// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import type { QueryOptions } from '../../typings/api';
import getFeatureFlagEnvironments from '../requests/getFeatureFlagEnvironments';

export const getFeatureFlagEnvironmentsQueryKey = 'getFeatureFlagEnvironmentsQueryKey';

function useGetFeatureFlagEnvironmentsQuery(
  featureFlagId: string,
  options: QueryOptions<typeof getFeatureFlagEnvironments> = {},
) {
  return useQuery({
    ...options,
    queryKey: [getFeatureFlagEnvironmentsQueryKey, featureFlagId],
    queryFn: () => getFeatureFlagEnvironments(featureFlagId),
  });
}

export default useGetFeatureFlagEnvironmentsQuery;
