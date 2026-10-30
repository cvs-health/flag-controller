// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { EnvironmentKey, FeatureFlagType } from 'shared-types';

function parseFlagsFiltersSearchParams(filtersParams: string) {
  const params = new URLSearchParams(filtersParams);
  const enabledIn = (params.get('enabled') === 'true' ? params.getAll('environmentKey') : []) as EnvironmentKey[];

  return {
    archived: params.get('archived') === 'true',
    createdAtEndDate: params.get('createdAtEndDate') || '',
    createdAtStartDate: params.get('createdAtStartDate') || '',
    enabledIn,
    updatedAtEndDate: params.get('updatedAtEndDate') || '',
    updatedAtStartDate: params.get('updatedAtStartDate') || '',
    featureFlagTypes: params.getAll('featureFlagTypes') as FeatureFlagType[],
  };
}

export default parseFlagsFiltersSearchParams;
