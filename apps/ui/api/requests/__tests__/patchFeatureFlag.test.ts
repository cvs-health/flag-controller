// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import patchFeatureFlag, { patchFeatureFlagUrl } from '../patchFeatureFlag';

describe('patchFeatureFlag', () => {
  it('should call the api to patch feature flag description', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData({}));
    const featureFlagId = 'flag-id-123';
    const body = {
      description: 'Updated flag description',
    };
    const payload = {
      featureFlagId,
      body,
    };

    await patchFeatureFlag(payload);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${patchFeatureFlagUrl(featureFlagId)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        cookie: '',
      },
    });
  });
});
