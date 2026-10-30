// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import parseFlagsFiltersSearchParams from '../parseFlagsFiltersSearchParams';

describe('parseFlagsFiltersSearchParams', () => {
  it('should only return environmentKey values when enabled equals "true"', () => {
    const enabledTrue = parseFlagsFiltersSearchParams(
      'enabled=true&environmentKey=production&environmentKey=development',
    );
    expect(enabledTrue.enabledIn).toEqual(['production', 'development']);

    const enabledFalse = parseFlagsFiltersSearchParams(
      'enabled=false&environmentKey=production&environmentKey=development',
    );
    expect(enabledFalse.enabledIn).toEqual([]);

    const missingEnabled = parseFlagsFiltersSearchParams('environmentKey=production&environmentKey=development');
    expect(missingEnabled.enabledIn).toEqual([]);
  });

  it('should provide empty string fallbacks for missing date values', () => {
    const withDates = parseFlagsFiltersSearchParams('createdAtStartDate=2023-01-01&updatedAtEndDate=2023-12-31');

    expect(withDates.createdAtStartDate).toEqual('2023-01-01');
    expect(withDates.updatedAtEndDate).toEqual('2023-12-31');
    expect(withDates.createdAtEndDate).toEqual('');
    expect(withDates.updatedAtStartDate).toEqual('');
  });

  it('should handle multiple featureFlagTypes values correctly', () => {
    const multiple = parseFlagsFiltersSearchParams(
      'featureFlagTypes=boolean&featureFlagTypes=string&featureFlagTypes=number',
    );

    expect(multiple.featureFlagTypes).toEqual(['boolean', 'string', 'number']);
  });

  it('should only return archived as true when the archived param equals "true"', () => {
    expect(parseFlagsFiltersSearchParams('archived=true').archived).toEqual(true);
    expect(parseFlagsFiltersSearchParams('archived=false').archived).toEqual(false);
    expect(parseFlagsFiltersSearchParams('').archived).toEqual(false);
  });
});
