// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import type { QueryOptions } from '../../typings/api';
import getFeatureFlagVariations from '../requests/getFeatureFlagVariations';

export const getFeatureFlagVariationsQueryKey = 'getFeatureFlagVariationsQueryKey';

function useGetFeatureFlagVariationsQuery(
  featureFlagId: string,
  options: QueryOptions<typeof getFeatureFlagVariations> = {},
) {
  return useQuery({
    ...options,
    queryKey: [getFeatureFlagVariationsQueryKey, featureFlagId],
    queryFn: () => getFeatureFlagVariations(featureFlagId),
  });
}

export default useGetFeatureFlagVariationsQuery;
