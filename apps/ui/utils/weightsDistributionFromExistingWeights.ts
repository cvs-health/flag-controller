// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FlagVariationsTableColumns, FractionalWeight } from 'shared-types';

function weightsDistributionFromExistingWeights(
  variations: FlagVariationsTableColumns[],
  weights: FractionalWeight[],
): FractionalWeight[] {
  return variations.map((variation) => {
    if (weights.length) {
      const weightIndex = weights.findIndex(([variationId]) => variationId === variation.id);

      if (weightIndex !== -1) {
        return weights[weightIndex] || [variation.id, 0];
      }

      return [variation.id, 0];
    }
    return [variation.id, 100 / variations.length];
  });
}

export default weightsDistributionFromExistingWeights;
