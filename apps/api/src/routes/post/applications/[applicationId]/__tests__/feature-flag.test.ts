// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { FeatureFlagType } from 'shared-types';

import { ConflictError } from '../../../../../errors/AppError.js';
import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';

describe('post/applications/:applicationId/feature-flag', () => {
  const newFeatureFlag = {
    description: 'hello this is a feature flag',
    key: 'my-cool-feature-flag',
    enabled: false,
    variations: {
      foo: true,
      bar: false,
    },
    defaultVariationKey: 'foo',
    type: 'boolean',
  };

  it('requests the route successfully', async () => {
    const mockCreatedFlag = {
      id: 'flag-1',
      key: 'my-cool-feature-flag',
      applicationId: 'test',
      archived: false,
      description: 'hello this is a feature flag',
      type: FeatureFlagType.Boolean,
      deletedAt: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    vi.mocked(mockServices.featureFlags.createFeatureFlag).mockResolvedValue(mockCreatedFlag);

    const app = build();
    const response = await app.inject({
      method: 'POST',
      url: '/applications/test/feature-flag',
      body: newFeatureFlag,
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(response.statusCode).toEqual(200);
    expect(mockServices.featureFlags.createFeatureFlag).toHaveBeenCalledExactlyOnceWith({
      actor: { id: '123', email: 'testuser@email.com' },
      applicationId: 'test',
      ...newFeatureFlag,
    });
    expect(JSON.parse(response.body)).toEqual({
      ...mockCreatedFlag,
      createdAt: mockCreatedFlag.createdAt.toISOString(),
      updatedAt: mockCreatedFlag.updatedAt.toISOString(),
    });
  });

  it('should only allow for the creation of a unique feature flag key per application', async () => {
    vi.mocked(mockServices.featureFlags.createFeatureFlag).mockRejectedValue(
      new ConflictError({
        message: "Flag 'my-cool-feature-flag' already exists",
        detail: "Flag 'my-cool-feature-flag' already exists",
      }),
    );

    const app = build();
    const response = await app.inject({
      method: 'POST',
      url: '/applications/test/feature-flag',
      body: newFeatureFlag,
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(response.statusCode).toEqual(409);
    expect(JSON.parse(response.body)).toMatchObject({
      status: 409,
      code: 'CONFLICT',
      detail: "Flag 'my-cool-feature-flag' already exists",
    });
  });
});
