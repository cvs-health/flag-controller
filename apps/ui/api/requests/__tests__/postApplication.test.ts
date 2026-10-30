// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import postApplication, { postApplicationUrl } from '../postApplication';

describe('postApplication', () => {
  it('should call the api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));
    const requestPayload = {
      teamId: '1',
      name: 'app-name',
    };

    await postApplication(requestPayload);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${postApplicationUrl}`, {
      method: 'POST',
      body: JSON.stringify(requestPayload),
      headers: {
        cookie: '',
        'Content-Type': 'application/json',
      },
    });
  });
});
