// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import postVariations, { postVariationsUrl } from '../postVariations';

describe('postVariations', () => {
  it('should call the api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));
    const requestPayload = [
      {
        flagId: 'flagId',
        key: 'key',
        value: 'value',
      },
    ];

    await postVariations(requestPayload);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${postVariationsUrl}`, {
      method: 'POST',
      body: JSON.stringify(requestPayload),
      headers: {
        'Content-Type': 'application/json',
        cookie: '',
      },
    });
  });
});
