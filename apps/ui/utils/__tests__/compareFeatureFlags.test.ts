// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import compareFeatureFlags from '../compareFeatureFlags';

describe('compareFeatureFlags', () => {
  const mockFlag = {
    applicationId: 'test-app-id',
    applicationName: 'test-app',
    archived: false,
    auditLog: [],
    createdAt: '2023-01-01T00:00:00Z',
    deletedAt: null,
    defaultVariation: 'true',
    description: 'A test flag',
    enabled: true,
    environmentKey: 'dev',
    id: '1',
    key: 'test-flag',
    updatedAt: '2023-01-01T00:00:00Z',
    name: 'Test Flag',
    rules: [],
    type: FeatureFlagType.Boolean,
    variations: { variation1: true, variation2: false },
  };

  it('should return empty array for identical flags', () => {
    const result = compareFeatureFlags(mockFlag, mockFlag);

    expect(result).toEqual([]);
  });

  it('should detect differences in property other than enabled', () => {
    const featureFlag2 = { ...mockFlag, name: 'New Name' };

    const result = compareFeatureFlags(mockFlag, featureFlag2);

    expect(result).toEqual([
      {
        property: 'name',
        oldValue: 'Test Flag',
        newValue: 'New Name',
      },
    ]);
  });
});
