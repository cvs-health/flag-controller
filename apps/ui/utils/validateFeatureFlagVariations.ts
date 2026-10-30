// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';

import validObject from './validObject';
import type { UpdatedVariation } from '../typings/variations';

function validateFeatureFlagVariations(variations: UpdatedVariation[], featureFlagType: FeatureFlagType) {
  return variations.reduce<Record<string, string>>((accumulator, variation) => {
    if (featureFlagType === FeatureFlagType.Object) {
      const valid = validObject(variation.value);

      if (valid) {
        return accumulator;
      }

      return {
        ...accumulator,
        [variation.id]: 'Must be a valid JSON object.',
      };
    }

    return accumulator;
  }, {});
}

export default validateFeatureFlagVariations;
