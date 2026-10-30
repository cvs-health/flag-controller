// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';

describe('patch/feature-flags/:featureFlagId', () => {
  it('updates the feature flag', async () => {
    const body = { description: 'Updated description', archived: true };
    const featureFlag = {
      applicationName: 'application-name',
      applicationId: 'application-1',
      archived: true,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      deletedAt: null,
      description: 'Updated description',
      id: 'feature-flag-id',
      key: 'feature-flag-key',
      type: FeatureFlagType.Boolean,
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    };
    const app = build();

    vi.mocked(mockServices.featureFlags.updateFeatureFlag).mockResolvedValue(featureFlag);

    const response = await app.inject({
      method: 'PATCH',
      url: '/feature-flags/feature-flag-id',
      body,
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(mockServices.featureFlags.updateFeatureFlag).toHaveBeenCalledExactlyOnceWith('feature-flag-id', body, '123');
    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual({
      ...featureFlag,
      createdAt: featureFlag.createdAt.toISOString(),
      updatedAt: featureFlag.updatedAt.toISOString(),
    });
  });
});
