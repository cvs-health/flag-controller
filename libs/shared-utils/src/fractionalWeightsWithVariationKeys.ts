// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FractionalsTableColumns, FractionalWeight } from 'shared-types';

type Fractional = Omit<FractionalsTableColumns, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> &
  Partial<Pick<FractionalsTableColumns, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>;

function fractionalWeightsWithVariationKeys(mapByIdKey: Map<string, string>, fractional: Fractional) {
  return {
    ...fractional,
    weights: fractional.weights.map(([variationId, weight]) => [
      mapByIdKey.get(variationId) || '',
      weight,
    ]) as FractionalWeight[],
  };
}

export default fractionalWeightsWithVariationKeys;
