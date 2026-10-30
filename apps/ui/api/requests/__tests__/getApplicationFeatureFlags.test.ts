// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getApplicationFeatureFlags, { getApplicationFeatureFlagsUrl } from '../getApplicationFeatureFlags';

describe('getApplicationFeatureFlags', () => {
  it('should call the api', async () => {
    const applicationId = 'application-id';
    const pagination = {
      page: 1,
      rows: 10,
    };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getApplicationFeatureFlags('application-id', pagination);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getApplicationFeatureFlagsUrl(applicationId, pagination)}`,
      expect.any(Object),
    );
  });
});
