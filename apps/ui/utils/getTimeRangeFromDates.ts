// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { endOfDay, isEqual, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { TimeRange } from '../typings/common';

function getTimeRangeFromDates(startDate: string, endDate: string, defaultTimeRange?: TimeRange): TimeRange {
  if (!startDate || !endDate) {
    return defaultTimeRange || TimeRange.None;
  }

  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);
  const now = new Date();
  const endOfToday = endOfDay(now);
  const isEndDateToday = isEqual(endOfDay(endDateTime), endOfToday);

  if (!isEndDateToday) {
    return TimeRange.Custom;
  }

  const diffInMinutes = differenceInMinutes(endDateTime, startDateTime);
  const diffInHours = differenceInHours(endDateTime, startDateTime);
  const diffInDays = differenceInDays(endDateTime, startDateTime);

  switch (true) {
    case diffInMinutes === 60:
      return TimeRange.Last60Minutes;
    case diffInHours === 24:
      return TimeRange.Last24Hours;
    case diffInDays === 7:
      return TimeRange.Last7Days;
    case diffInDays === 14:
      return TimeRange.Last14Days;
    case diffInDays === 30:
      return TimeRange.Last30Days;
    case diffInDays === 60:
      return TimeRange.Last60Days;
    default:
      return TimeRange.Custom;
  }
}

export default getTimeRangeFromDates;
