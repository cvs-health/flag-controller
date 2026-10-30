// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ActionType, SubjectType, EnvironmentKey } from 'shared-types';

import { TimeRange } from '../typings/common';

function parseLogFiltersSearchParams(filtersParams: string) {
  const params = new URLSearchParams(filtersParams);

  return {
    actionEndDate: params.get('actionEndDate') || '',
    actionStartDate: params.get('actionStartDate') || '',
    actionTypes: params.getAll('actionType') as ActionType[],
    environmentKeys: params.getAll('environmentKey') as EnvironmentKey[],
    subjectTypes: params.getAll('subjectType') as SubjectType[],
    timeRange: (params.get('timeRange') as TimeRange) || TimeRange.None,
  };
}

export default parseLogFiltersSearchParams;
