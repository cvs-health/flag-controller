// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import getFeatureFlagEnvironments, { getFeatureFlagEnvironmentsUrl } from '../getFeatureFlagEnvironments';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';

describe('getFeatureFlagEnvironments', () => {
  it('should call the api', async () => {
    const featureFlagId = 'feature-flag-id';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getFeatureFlagEnvironments(featureFlagId);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}${getFeatureFlagEnvironmentsUrl(featureFlagId)}`,
      expect.any(Object),
    );
  });
});
