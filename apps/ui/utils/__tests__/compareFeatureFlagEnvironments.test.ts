// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { EnvironmentKey } from 'shared-types';
import { describe, expect, it } from 'vitest';

import compareFeatureFlagEnvironments from '../compareFeatureFlagEnvironments';

describe('compareFeatureFlagEnvironments', () => {
  const flagEnvironment = {
    createdAt: '2023-01-01T00:00:00Z',
    defaultServeId: 'variation-id-1',
    defaultServeKey: 'on',
    enabled: true,
    environmentId: 'env-1',
    environmentKey: EnvironmentKey.Development,
    flagId: 'flag-1',
    flag: {
      applicationId: 'app-1',
      key: 'test-flag',
    },
    updatedAt: '2023-01-01T00:00:00Z',
  };

  it('should return empty array for identical feature flag environments', () => {
    const result = compareFeatureFlagEnvironments(flagEnvironment, flagEnvironment);

    expect(result).toEqual([]);
  });

  it('should detect differences', () => {
    const featureFlag2 = {
      ...flagEnvironment,
      defaultServeId: 'variation-id-2',
      defaultServeKey: 'off',
      enabled: false,
    };

    const result = compareFeatureFlagEnvironments(flagEnvironment, featureFlag2);

    expect(result).toEqual([
      {
        newValue: 'off',
        oldValue: 'on',
        property: 'defaultServeKey',
      },
      {
        newValue: 'off',
        oldValue: 'on',
        property: 'enabled',
      },
    ]);
  });
});
