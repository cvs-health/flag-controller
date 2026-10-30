// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getFeatureFlagVariations, { getFeatureFlagVariationsUrl } from '../getFeatureFlagVariations';

describe('getFeatureFlagVariations', () => {
  it('should call the api', async () => {
    const featureFlagId = 'feature-flag-id';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getFeatureFlagVariations(featureFlagId);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}${getFeatureFlagVariationsUrl(featureFlagId)}`,
      expect.any(Object),
    );
  });
});
