// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';
import { describe, expect, it } from 'vitest';
import featureFlagVariationsFromFormData from '../featureFlagVariationsFromFormData';

describe('featureFlagVariationsFromFormData', () => {
  it('should provide formatted varations based on form data', () => {
    const variations = {
      foo: true,
      bar: false,
    };
    expect(featureFlagVariationsFromFormData({ foo: 'true', bar: 'false' }, FeatureFlagType.Boolean)).toEqual(
      variations,
    );
  });
});
