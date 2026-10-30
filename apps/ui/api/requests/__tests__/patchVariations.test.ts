// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import patchVariations, { patchVariationsUrl } from '../patchVariations';

describe('patchVariations', () => {
  it('should call the api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));
    const requestPayload = [
      {
        id: 'id',
        key: 'key',
        value: 'value',
      },
    ];

    await patchVariations(requestPayload);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${patchVariationsUrl}`, {
      method: 'PATCH',
      body: JSON.stringify(requestPayload),
      headers: {
        'Content-Type': 'application/json',
        cookie: '',
      },
    });
  });
});
