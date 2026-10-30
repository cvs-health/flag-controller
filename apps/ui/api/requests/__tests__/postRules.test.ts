// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import postRules, { postRulesUrl } from '../postRules';

describe('postRules', () => {
  it('should call the api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));
    const body = {
      conditions: [],
      environmentId: 'environment-id',
      flagId: 'flag-id',
      key: 'rule-key',
      orderPosition: 0,
      serveFractionalId: null,
      serveVariationId: null,
    };

    await postRules([body]);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(`${process.env.API_BASE_URL}${postRulesUrl}`, {
      method: 'POST',
      body: JSON.stringify([body]),
      headers: {
        'Content-Type': 'application/json',
        cookie: '',
      },
    });
  });
});
