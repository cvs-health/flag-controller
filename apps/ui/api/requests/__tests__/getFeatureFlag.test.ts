// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getFeatureFlag, { getFeatureFlagUrl } from '../getFeatureFlag';

describe('getFeatureFlag', () => {
  it('should call the api', async () => {
    const applicationName = 'applicationName';
    const featureFlagKey = 'featureFlagKey';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getFeatureFlag(applicationName, featureFlagKey);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}${getFeatureFlagUrl(applicationName, featureFlagKey)}`,
      expect.any(Object),
    );
  });
});
