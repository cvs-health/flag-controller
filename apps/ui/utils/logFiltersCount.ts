// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { LogFilters } from '../typings/audits';
import { TimeRange } from '../typings/common';

function logFiltersCount(filters: Omit<LogFilters, 'actionEndDate' | 'actionStartDate'>) {
  const actionTypesCount = filters.actionTypes.length > 0 ? 1 : 0;
  const dateCount = !filters.timeRange || filters.timeRange === TimeRange.None ? 0 : 1;
  const environmentCount = filters.environmentKeys.length > 0 ? 1 : 0;
  const subjectTypesCount = filters.subjectTypes.length > 0 ? 1 : 0;

  return actionTypesCount + dateCount + environmentCount + subjectTypesCount;
}

export default logFiltersCount;
