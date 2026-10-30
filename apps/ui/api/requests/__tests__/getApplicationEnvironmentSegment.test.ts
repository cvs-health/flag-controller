// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getApplicationEnvironmentSegment, {
  getApplicationEnvironmentSegmentUrl,
} from '../getApplicationEnvironmentSegment';

describe('getApplicationEnvironmentSegment', () => {
  it('calls fetch with the correct URL and returns the result', async () => {
    const applicationName = 'app1';
    const environmentKey = 'dev';
    const segmentKey = 'segmentA';
    const mockSegment = {
      id: 1,
      key: segmentKey,
      applicationName,
      environmentKey,
      description: 'desc',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
      rules: [],
    };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(mockSegment));

    await getApplicationEnvironmentSegment(applicationName, environmentKey, segmentKey);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getApplicationEnvironmentSegmentUrl(applicationName, environmentKey, segmentKey)}`,
      expect.any(Object),
    );
  });
});
