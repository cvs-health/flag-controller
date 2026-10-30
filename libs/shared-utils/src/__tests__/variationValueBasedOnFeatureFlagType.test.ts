// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import variationValueBasedOnFeatureFlagType from '../variationValueBasedOnFeatureFlagType.js';

describe('variationValueBasedOnFeatureFlagType', () => {
  it('should provide the proper value type', () => {
    expect(typeof variationValueBasedOnFeatureFlagType(FeatureFlagType.Boolean, 'true')).toEqual('boolean');
    expect(typeof variationValueBasedOnFeatureFlagType(FeatureFlagType.Integer, '1')).toEqual('number');
    expect(typeof variationValueBasedOnFeatureFlagType(FeatureFlagType.Object, '{}')).toEqual('object');
    expect(typeof variationValueBasedOnFeatureFlagType(FeatureFlagType.Object)).toEqual('object');
    expect(typeof variationValueBasedOnFeatureFlagType(FeatureFlagType.Object, {})).toEqual('object');
    expect(typeof variationValueBasedOnFeatureFlagType(FeatureFlagType.Object, '')).toEqual('object');
    expect(typeof variationValueBasedOnFeatureFlagType(FeatureFlagType.String, 'test')).toEqual('string');
  });
});
