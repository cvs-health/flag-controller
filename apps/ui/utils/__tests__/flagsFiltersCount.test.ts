// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import type { FeatureFlagsFilters } from '../../typings/flags';
import flagsFiltersCount from '../flagsFiltersCount';
import { EnvironmentKey, FeatureFlagType } from 'shared-types';

describe('flagsFiltersCount', () => {
  it('should return 0 when all filter counts resolve to 0', () => {
    const filters: FeatureFlagsFilters = {
      archived: false,
      enabledIn: [],
      createdAtStartDate: '',
      createdAtEndDate: '',
      updatedAtStartDate: '',
      updatedAtEndDate: '',
      featureFlagTypes: [],
    };
    expect(flagsFiltersCount(filters)).toEqual(0);
  });

  it('should return 5 when all filter counts resolve to 1', () => {
    const filters: FeatureFlagsFilters = {
      archived: true,
      enabledIn: [EnvironmentKey.Production],
      createdAtStartDate: '2023-01-01',
      createdAtEndDate: '2023-12-31',
      updatedAtStartDate: '2023-06-01',
      updatedAtEndDate: '2023-06-30',
      featureFlagTypes: [FeatureFlagType.Boolean],
    };
    expect(flagsFiltersCount(filters)).toEqual(5);
  });
});
