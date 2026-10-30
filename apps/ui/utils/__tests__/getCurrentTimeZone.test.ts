// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { TimeZone } from 'shared-types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import getCurrentTimeZone from '../getCurrentTimeZone';

describe('getCurrentTimeZone', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the system timezone when it is supported', () => {
    vi.spyOn(Intl, 'DateTimeFormat').mockReturnValue({
      resolvedOptions: () => ({ timeZone: TimeZone.Chicago }),
    } as Intl.DateTimeFormat);

    expect(getCurrentTimeZone()).toBe(TimeZone.Chicago);
  });

  it('falls back to New York when system timezone is unsupported', () => {
    vi.spyOn(Intl, 'DateTimeFormat').mockReturnValue({
      resolvedOptions: () => ({ timeZone: 'UTC' }),
    } as Intl.DateTimeFormat);

    expect(getCurrentTimeZone()).toBe(TimeZone.NewYork);
  });
});
