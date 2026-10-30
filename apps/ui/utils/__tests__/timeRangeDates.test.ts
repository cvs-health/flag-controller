// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { endOfDay, formatISO, startOfDay, subDays } from 'date-fns';

import timeRangeDates from '../timeRangeDates';
import { TimeRange } from '../../typings/common';

describe('timeRangeDates', () => {
  const mockNow = new Date('2025-11-05T15:30:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it(`should return formatted start and end dates when range is ${TimeRange.Custom}`, () => {
    const startDate = '2025-11-01T10:00:00Z';
    const endDate = '2025-11-03T18:00:00Z';

    const [actualStart, actualEnd] = timeRangeDates(startDate, endDate, TimeRange.Custom);

    expect(actualStart).toBe(formatISO(startOfDay(startDate)));
    expect(actualEnd).toBe(formatISO(endOfDay(endDate)));
  });

  it(`should return empty strings when range is ${TimeRange.None}`, () => {
    const [actualStart, actualEnd] = timeRangeDates(undefined, undefined, TimeRange.None);

    expect(actualStart).toBe('');
    expect(actualEnd).toBe('');
  });

  it(`should return correct dates for when range is ${TimeRange.Last7Days}`, () => {
    const [actualStart, actualEnd] = timeRangeDates(undefined, undefined, TimeRange.Last7Days);
    const expectedStartDate = formatISO(startOfDay(subDays(mockNow, 7)));
    const expectedEndDate = formatISO(endOfDay(mockNow));

    expect(actualStart).toBe(expectedStartDate);
    expect(actualEnd).toBe(expectedEndDate);
  });
});
