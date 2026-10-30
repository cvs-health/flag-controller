// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getApplicationSegments, { getApplicationSegmentsUrl } from '../getApplicationSegments';

describe('getApplicationSegments', () => {
  it('should call the api', async () => {
    const applicationId = 'applicationId';
    const pagination = { page: 1, rows: 10 };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getApplicationSegments(applicationId, pagination);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getApplicationSegmentsUrl(applicationId, pagination)}`,
      expect.any(Object),
    );
  });
});
