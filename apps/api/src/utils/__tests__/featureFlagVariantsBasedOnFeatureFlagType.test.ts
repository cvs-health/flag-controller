// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';
import { describe, expect, it } from 'vitest';
import featureFlagVariantsBasedOnFeatureFlagType from '../featureFlagVariantsBasedOnFeatureFlagType.js';

describe('featureFlagVariantsBasedOnFeatureFlagType', () => {
  it('provides the proper value type', () => {
    // @ts-expect-error Using a different type than the one expected for the variant values
    expect(featureFlagVariantsBasedOnFeatureFlagType({ foo: 'false', bar: 'true' }, FeatureFlagType.Boolean)).toEqual({
      foo: false,
      bar: true,
    });
    expect(featureFlagVariantsBasedOnFeatureFlagType({ foo: false, bar: true }, FeatureFlagType.Boolean)).toEqual({
      foo: false,
      bar: true,
    });
    expect(featureFlagVariantsBasedOnFeatureFlagType({ foo: 1, bar: 0 }, FeatureFlagType.Integer)).toEqual({
      foo: 1,
      bar: 0,
    });
    // @ts-expect-error Using a different type than the one expected for the variant values
    expect(featureFlagVariantsBasedOnFeatureFlagType({ foo: '1', bar: '0' }, FeatureFlagType.Integer)).toEqual({
      foo: 1,
      bar: 0,
    });
    // @ts-expect-error Using a different type than the one expected for the variant values
    expect(featureFlagVariantsBasedOnFeatureFlagType({ foo: '{}', bar: '{}' }, FeatureFlagType.Object)).toEqual({
      foo: {},
      bar: {},
    });
    expect(featureFlagVariantsBasedOnFeatureFlagType({ foo: {}, bar: {} }, FeatureFlagType.Object)).toEqual({
      foo: {},
      bar: {},
    });
    expect(featureFlagVariantsBasedOnFeatureFlagType({ foo: 'yes', bar: 'ok' }, FeatureFlagType.String)).toEqual({
      foo: 'yes',
      bar: 'ok',
    });
  });
});
