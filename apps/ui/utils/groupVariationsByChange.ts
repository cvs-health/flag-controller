// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { isEqual } from 'es-toolkit/predicate';
import type { ParsedFeatureFlagVariation } from './featureFlagVariationsFormDataToVariations';
import type { ChangedVariation, NewVariation, UpdatedVariation, Variation } from '../typings/variations';

/**
 * An array of arrays where [0] are the created variations, [1] are the updated variations, and [2] are the removed variations, and [3] are the unmodified variations
 */
function groupVariationsByChange(variations: ParsedFeatureFlagVariation[], existingVariations: Variation[]) {
  const existingVariationsById = existingVariations.reduce<Record<string, UpdatedVariation>>(
    (variations, variation) => {
      const { createdAt, updatedAt, applicationName, flagKey, ...rest } = variation;
      return {
        ...variations,
        [variation.id]: {
          ...rest,
          value: String(variation.value),
        },
      };
    },
    {},
  );

  return variations.reduce<[NewVariation[], ChangedVariation[], string[], UpdatedVariation[]]>(
    (accumulator, variation) => {
      const { created, removed, ...rest } = variation;

      if (removed) {
        return [accumulator[0], accumulator[1], [...accumulator[2], rest.id], accumulator[3]];
      }

      if (created) {
        const { id, ...restWithoutId } = rest;
        return [[...accumulator[0], restWithoutId], accumulator[1], accumulator[2], accumulator[3]];
      }

      const existingVariation = existingVariationsById[variation.id];

      const isUnchanged = isEqual(rest, existingVariation);

      if (isUnchanged) {
        return [accumulator[0], accumulator[1], accumulator[2], [...accumulator[3], variation]];
      }

      return [accumulator[0], [...accumulator[1], rest], accumulator[2], accumulator[3]];
    },
    [[], [], [], []],
  );
}

export default groupVariationsByChange;
