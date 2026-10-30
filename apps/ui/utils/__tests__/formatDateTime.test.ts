// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import formatDateTime from '../formatDateTime';

describe('formatDateTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 1, 1));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should format date when date is today', () => {
    const today = new Date();
    const result = formatDateTime(today.toISOString());

    expect(result).toEqual('Today at 12:00 AM');
  });

  it('should format date when date is not today', () => {
    const pastDate = new Date(2025, 2, 2);
    const result = formatDateTime(pastDate.toISOString());

    expect(result).toEqual('03/02/2025 at 12:00 AM');
  });
});
