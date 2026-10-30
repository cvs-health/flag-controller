// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';

describe('get/applications/:applicationName/feature-flags/:featureFlagKey', () => {
  it('returns the feature flag', async () => {
    const featureFlag = {
      applicationId: 'application-1',
      applicationName: 'my-app',
      archived: false,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      deletedAt: null,
      description: 'A feature flag',
      id: 'feature-flag-id',
      key: 'feature-flag-key',
      type: FeatureFlagType.Boolean,
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    };
    const app = build();

    vi.mocked(mockServices.featureFlags.getFeatureFlagByApplicationNameAndKey).mockResolvedValue(featureFlag);

    const response = await app.inject({
      method: 'GET',
      url: '/applications/my-app/feature-flags/feature-flag-key',
    });

    await app.close();

    expect(app.services.featureFlagService.getFeatureFlagByApplicationNameAndKey).toHaveBeenCalledExactlyOnceWith(
      'my-app',
      'feature-flag-key',
    );
    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual({
      ...featureFlag,
      createdAt: featureFlag.createdAt.toISOString(),
      updatedAt: featureFlag.updatedAt.toISOString(),
    });
  });
});
