// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getFeatureFlagRules, { getFeatureFlagRulesUrl } from '../getFeatureFlagRules';

describe('getFeatureFlagRules', () => {
  it('should call the api', async () => {
    const environmentId = 'environmentId';
    const featureFlagId = 'featureFlagId';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getFeatureFlagRules(environmentId, featureFlagId);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}${getFeatureFlagRulesUrl(environmentId, featureFlagId)}`,
      expect.any(Object),
    );
  });
});
