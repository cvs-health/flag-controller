// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { TIMEZONE_FRIENDLY_NAMES } from 'shared-constants';
import { TimeZone } from 'shared-types';
import { describe, expect, it } from 'vitest';

import getTimeZoneOptions from '../getTimeZoneOptions';

describe('getTimeZoneOptions', () => {
  it('returns one option per supported timezone', () => {
    const date = new Date('2026-01-15T12:00:00.000Z');
    const result = getTimeZoneOptions(date);

    expect(result).toHaveLength(Object.values(TimeZone).length);

    for (const option of result) {
      expect(Object.values(TimeZone)).toContain(option.value);
      expect(option.text).toContain(TIMEZONE_FRIENDLY_NAMES[option.value as TimeZone]);
    }

    expect(result.find((option) => option.value === TimeZone.NewYork)?.text).toBe(
      `${TIMEZONE_FRIENDLY_NAMES[TimeZone.NewYork]} (UTC - 05:00)`,
    );
  });

  it('omits UTC offsets when disabled', () => {
    const date = new Date('2026-01-15T12:00:00.000Z');
    const result = getTimeZoneOptions(date, false);

    expect(result).toHaveLength(Object.values(TimeZone).length);
    expect(result.find((option) => option.value === TimeZone.NewYork)?.text).toBe(
      TIMEZONE_FRIENDLY_NAMES[TimeZone.NewYork],
    );
  });
});
