// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import patchFeatureFlagEnvironment, { patchFeatureFlagEnvironmentUrl } from '../patchFeatureFlagEnvironment';

describe('patchFeatureFlagEnvironment', () => {
  it('should call the api to patch feature flag environment', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData({}));
    const environmentId = 'env-id-123';
    const featureFlagId = 'flag-id-456';
    const body = {
      defaultServeId: 'serve-id-789',
    };
    const payload = {
      environmentId,
      featureFlagId,
      body,
    };

    await patchFeatureFlagEnvironment(payload);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${patchFeatureFlagEnvironmentUrl(environmentId, featureFlagId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          cookie: '',
        },
      },
    );
  });
});
