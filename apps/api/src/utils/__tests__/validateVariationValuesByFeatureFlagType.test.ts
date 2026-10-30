// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { FeatureFlagType } from 'shared-types';
import { ValidationError } from '../../errors/AppError.js';
import validateVariationValuesByFeatureFlagType from '../validateVariationValuesByFeatureFlagType.js';

describe('validateVariationValuesByFeatureFlagType', () => {
  it('accepts values matching the feature flag type', () => {
    expect(() => validateVariationValuesByFeatureFlagType(FeatureFlagType.Boolean, { on: true })).not.toThrow();
    expect(() => validateVariationValuesByFeatureFlagType(FeatureFlagType.Integer, { on: 1 })).not.toThrow();
    expect(() => validateVariationValuesByFeatureFlagType(FeatureFlagType.String, { on: 'enabled' })).not.toThrow();
    expect(() =>
      validateVariationValuesByFeatureFlagType(FeatureFlagType.Object, { on: { enabled: true } }),
    ).not.toThrow();
  });

  it.each([null, [], 'not-json', 1, true])('rejects %j for object feature flags', (value) => {
    expect(() => validateVariationValuesByFeatureFlagType(FeatureFlagType.Object, { on: value })).toThrow(
      ValidationError,
    );
  });
});
