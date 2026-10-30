// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ActionType, EnvironmentKey, SubjectType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import logFiltersCount from '../logFiltersCount';
import type { LogFilters } from '../../typings/audits';
import { TimeRange } from '../../typings/common';

describe('logFiltersCount', () => {
  it('should return 0 when all filter counts resolve to 0', () => {
    const filters: LogFilters = {
      environmentKeys: [],
      actionStartDate: '',
      actionEndDate: '',
      subjectTypes: [],
      actionTypes: [],
      timeRange: TimeRange.None,
    };
    expect(logFiltersCount(filters)).toEqual(0);
  });

  it('should return 4 when all filter counts resolve to 1', () => {
    const filters: LogFilters = {
      environmentKeys: [EnvironmentKey.Production],
      actionStartDate: '2023-01-01',
      actionEndDate: '2023-12-31',
      subjectTypes: [SubjectType.FeatureFlag],
      actionTypes: [ActionType.Create],
      timeRange: TimeRange.Last14Days,
    };
    expect(logFiltersCount(filters)).toEqual(4);
  });
});
