// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getApplicationSegment, { getApplicationSegmentUrl } from '../getApplicationSegment';

describe('getApplicationSegment', () => {
  it('should call the api', async () => {
    const applicationName = 'applicationName';
    const segmentKey = 'segmentKey';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData({}));

    await getApplicationSegment(applicationName, segmentKey);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getApplicationSegmentUrl(applicationName, segmentKey)}`,
      expect.any(Object),
    );
  });
});
