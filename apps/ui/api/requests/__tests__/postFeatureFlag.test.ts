// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import postFeatureFlag, { postFeatureFlagUrl } from '../postFeatureFlag';
import { FeatureFlagType } from 'shared-types';

describe('postFeatureFlag', () => {
  it('should call the api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));
    const payload = {
      applicationId: 'application-id',
      body: {
        defaultVariationKey: 'variation-key',
        description: 'A feature flag',
        enabled: true,
        key: 'my-feature-flag',
        type: FeatureFlagType.Boolean,
        variations: {
          foo: true,
          bar: false,
        },
      },
    };

    await postFeatureFlag(payload);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}${postFeatureFlagUrl(payload.applicationId)}`,
      {
        method: 'POST',
        body: JSON.stringify(payload.body),
        headers: {
          'Content-Type': 'application/json',
          cookie: '',
        },
      },
    );
  });
});
