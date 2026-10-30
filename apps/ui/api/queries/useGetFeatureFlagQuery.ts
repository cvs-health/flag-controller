// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import type { QueryOptions } from '../../typings/api';
import getFeatureFlag from '../requests/getFeatureFlag';

export const getFeatureFlagQueryKey = 'getFeatureFlagQueryKey';

function useGetFeatureFlagQuery(
  applicationName: string,
  featureFlagKey: string,
  options: QueryOptions<typeof getFeatureFlag> = {},
) {
  return useQuery({
    ...options,
    queryKey: [getFeatureFlagQueryKey, applicationName, featureFlagKey],
    queryFn: () => getFeatureFlag(applicationName, featureFlagKey),
  });
}

export default useGetFeatureFlagQuery;
