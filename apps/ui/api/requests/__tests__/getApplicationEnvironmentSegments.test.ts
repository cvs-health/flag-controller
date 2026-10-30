// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getApplicationEnvironmentSegments, {
  getApplicationEnvironmentSegmentsUrl,
} from '../getApplicationEnvironmentSegments';

describe('getApplicationEnvironmentSegments', () => {
  it('should call the api', async () => {
    const applicationName = 'applicationName';
    const environmentKey = 'environmentKey';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getApplicationEnvironmentSegments(applicationName, environmentKey);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getApplicationEnvironmentSegmentsUrl(applicationName, environmentKey)}`,
      expect.any(Object),
    );
  });
});
