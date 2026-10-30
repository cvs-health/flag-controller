// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import postSegments, { postSegmentsUrl } from '../postSegments';

describe('postSegments', () => {
  it('should call the api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));
    const payload = [
      {
        applicationId: 'application-id',
        key: 'key',
        description: 'description',
      },
    ];

    await postSegments(payload);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(`${process.env.API_BASE_URL}${postSegmentsUrl}`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: expect.any(Object),
    });
  });
});
