// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { formatISO, startOfDay, endOfDay, subMinutes, subHours, subDays } from 'date-fns';

import getTimeRangeFromDates from '../getTimeRangeFromDates';
import { TimeRange } from '../../typings/common';

describe('getTimeRangeFromDates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-11-05T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should correctly identify all TimeRange values', () => {
    const endOfToday = endOfDay(new Date());
    const yesterday = subDays(new Date(), 1);

    expect(getTimeRangeFromDates('', '')).toBe(TimeRange.None);
    expect(getTimeRangeFromDates(formatISO(subMinutes(endOfToday, 60)), formatISO(endOfToday))).toBe(
      TimeRange.Last60Minutes,
    );
    expect(getTimeRangeFromDates(formatISO(subHours(endOfToday, 24)), formatISO(endOfToday))).toBe(
      TimeRange.Last24Hours,
    );
    expect(getTimeRangeFromDates(formatISO(startOfDay(subDays(endOfToday, 7))), formatISO(endOfToday))).toBe(
      TimeRange.Last7Days,
    );
    expect(getTimeRangeFromDates(formatISO(startOfDay(subDays(endOfToday, 14))), formatISO(endOfToday))).toBe(
      TimeRange.Last14Days,
    );
    expect(getTimeRangeFromDates(formatISO(startOfDay(subDays(endOfToday, 30))), formatISO(endOfToday))).toBe(
      TimeRange.Last30Days,
    );
    expect(getTimeRangeFromDates(formatISO(startOfDay(subDays(endOfToday, 60))), formatISO(endOfToday))).toBe(
      TimeRange.Last60Days,
    );
    expect(getTimeRangeFromDates(formatISO(startOfDay(subDays(endOfToday, 5))), formatISO(endOfToday))).toBe(
      TimeRange.Custom,
    );
    expect(getTimeRangeFromDates(formatISO(startOfDay(subDays(yesterday, 7))), formatISO(endOfDay(yesterday)))).toBe(
      TimeRange.Custom,
    );
  });
});
