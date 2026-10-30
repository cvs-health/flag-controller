// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getFeatureFlags, { getFeatureFlagsUrl } from '../getFeatureFlags';

describe('getFeatureFlags', () => {
  it('should call the api', async () => {
    const search = 'search';
    const pagination = {
      page: 1,
      rows: 10,
    };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getFeatureFlags(pagination, search);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}${getFeatureFlagsUrl(pagination, search)}`,
      expect.any(Object),
    );
  });
});
