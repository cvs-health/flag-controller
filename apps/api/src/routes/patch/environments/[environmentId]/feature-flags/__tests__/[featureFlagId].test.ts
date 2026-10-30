// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { EnvironmentKey } from 'shared-types';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';

describe('patch/environments/:environmentId/feature-flags/:featureFlagId', () => {
  it('should successfully resolve', async () => {
    const body = { defaultServeId: 'variation-1', enabled: true };
    const flagEnvironment = {
      createdAt: new Date('2024-01-01T00:00:00Z'),
      defaultServeId: 'variation-1',
      enabled: true,
      environmentId: 'environment-id',
      updatedAt: new Date('2024-01-02T00:00:00Z'),
      flagId: 'feature-flag-id',
    };
    const flagEnvironmentJoined = {
      ...flagEnvironment,
      defaultServeKey: 'variation-1-key',
      environmentKey: EnvironmentKey.Development,
      flag: {
        key: 'feature-flag-key',
        applicationId: 'application-id',
      },
    };
    const app = build();

    vi.mocked(mockServices.flagEnvironments.updateFlagEnvironment).mockResolvedValue(flagEnvironmentJoined);

    const response = await app.inject({
      method: 'PATCH',
      url: '/environments/environment-id/feature-flags/feature-flag-id',
      body,
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(mockServices.flagEnvironments.updateFlagEnvironment).toHaveBeenCalledExactlyOnceWith(
      'feature-flag-id',
      'environment-id',
      body,
      '123',
    );
    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual({
      ...flagEnvironment,
      createdAt: flagEnvironment.createdAt.toISOString(),
      updatedAt: flagEnvironment.updatedAt.toISOString(),
    });
  });
});
