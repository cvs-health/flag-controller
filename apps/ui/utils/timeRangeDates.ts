// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { endOfDay, endOfToday, formatISO, startOfDay } from 'date-fns';

import { TimeRange } from '../typings/common';
import getDateBasedOnTimeRange from './getDateBasedOnTimeRange';

function timeRangeDates(startDate?: string, endDate?: string, timeRange: TimeRange = TimeRange.None): [string, string] {
  if (timeRange === TimeRange.Custom) {
    return [formatISO(startOfDay(startDate as string)), formatISO(endOfDay(endDate as string))];
  }

  const end = endOfToday();
  const noneSelected = timeRange === TimeRange.None;
  const startBasedOnTimeRange = getDateBasedOnTimeRange(end, timeRange);
  const actionStartDate = noneSelected ? '' : formatISO(startOfDay(startBasedOnTimeRange));
  const actionEndDate = noneSelected ? '' : formatISO(end);

  return [actionStartDate, actionEndDate];
}

export default timeRangeDates;
