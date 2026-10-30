// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { startOfDay, subDays, subHours, subMinutes } from 'date-fns';

import { TimeRange } from '../typings/common';

function getDateBasedOnTimeRange(now: Date, range: TimeRange) {
  let date: Date | string = startOfDay(now);

  switch (range) {
    case TimeRange.Last60Minutes:
      date = subMinutes(now, 60);
      break;
    case TimeRange.Last24Hours:
      date = subHours(now, 24);
      break;
    case TimeRange.Last7Days:
      date = subDays(now, 7);
      break;
    case TimeRange.Last14Days:
      date = subDays(now, 14);
      break;
    case TimeRange.Last30Days:
      date = subDays(now, 30);
      break;
    case TimeRange.Last60Days:
      date = subDays(now, 60);
      break;
    default:
      // TimeRange.None
      date = '';
      break;
  }

  return date;
}

export default getDateBasedOnTimeRange;
