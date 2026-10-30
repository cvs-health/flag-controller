// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { subDays, subHours, subMinutes } from 'date-fns';

import getDateBasedOnTimeRange from '../getDateBasedOnTimeRange';
import { TimeRange } from '../../typings/common';

describe('getDateBasedOnTimeRange', () => {
  const now = new Date('2025-08-11T12:00:00Z');

  it('should return the correct date for each TimeRange case', () => {
    expect(getDateBasedOnTimeRange(now, TimeRange.Last60Minutes)).toEqual(subMinutes(now, 60));
    expect(getDateBasedOnTimeRange(now, TimeRange.Last24Hours)).toEqual(subHours(now, 24));
    expect(getDateBasedOnTimeRange(now, TimeRange.Last7Days)).toEqual(subDays(now, 7));
    expect(getDateBasedOnTimeRange(now, TimeRange.Last14Days)).toEqual(subDays(now, 14));
    expect(getDateBasedOnTimeRange(now, TimeRange.Last30Days)).toEqual(subDays(now, 30));
    expect(getDateBasedOnTimeRange(now, TimeRange.Last60Days)).toEqual(subDays(now, 60));
    expect(getDateBasedOnTimeRange(now, TimeRange.None)).toEqual('');
    expect(getDateBasedOnTimeRange(now, TimeRange.Custom)).toEqual('');
  });
});
