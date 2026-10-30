// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ActionType, EnvironmentKey, SubjectType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import parseLogFiltersSearchParams from '../parseLogFiltersSearchParams';
import { TimeRange } from '../../typings/common';

describe('parseLogFiltersSearchParams', () => {
  it('should handle provided filter params', () => {
    const result = parseLogFiltersSearchParams(
      'actionEndDate=2023-12-31&actionStartDate=2023-01-01&actionType=create&environmentKey=production&subjectType=feature-flag&timeRange=last-7-days',
    );

    expect(result).toEqual({
      actionEndDate: '2023-12-31',
      actionStartDate: '2023-01-01',
      actionTypes: [ActionType.Create],
      environmentKeys: [EnvironmentKey.Production],
      subjectTypes: [SubjectType.FeatureFlag],
      timeRange: TimeRange.Last7Days,
    });

    const resultWithDefaults = parseLogFiltersSearchParams('');

    expect(resultWithDefaults).toEqual({
      actionEndDate: '',
      actionStartDate: '',
      actionTypes: [],
      environmentKeys: [],
      subjectTypes: [],
      timeRange: TimeRange.None,
    });
  });
});
