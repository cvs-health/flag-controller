// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import getSettledRequestErrorMessage from '../getSettledRequestErrorMessage';

describe('getSettledRequestErrorMessage', () => {
  it('returns an empty array when all requests succeed', () => {
    const results: PromiseSettledResult<string>[] = [
      { status: 'fulfilled', value: 'ok' },
      { status: 'fulfilled', value: 'still ok' },
    ];

    expect(getSettledRequestErrorMessage(results)).toEqual([]);
  });

  it('collects rejected error messages in order', () => {
    const results: PromiseSettledResult<string>[] = [
      { status: 'fulfilled', value: 'ok' },
      { status: 'rejected', reason: new Error('first failed') },
      { status: 'rejected', reason: 'second failed' },
      { status: 'rejected', reason: null },
    ];

    expect(getSettledRequestErrorMessage(results)).toEqual(['first failed', 'second failed', 'Request failed']);
  });
});
