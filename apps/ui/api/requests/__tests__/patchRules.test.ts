// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import patchRules, { patchRulesUrl } from '../patchRules';

describe('patchRules', () => {
  it('should call the api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));
    const body = {
      conditions: [],
      key: 'key',
      id: '1',
      orderPosition: 0,
      serveVariationId: 'some-variation-id',
      serveFractionalId: null,
    };

    await patchRules([body]);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(`${process.env.API_BASE_URL}${patchRulesUrl}`, {
      method: 'PATCH',
      body: JSON.stringify([body]),
      headers: expect.any(Object),
    });
  });
});
