// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagTypePrimitive, FlagVariationsTableColumns } from 'shared-types';

function variationsByKeyValue(variations: FlagVariationsTableColumns[]) {
  return variations.reduce<Record<string, FeatureFlagTypePrimitive>>((accumulator, variation) => {
    accumulator[variation.key] = variation.value;
    return accumulator;
  }, {});
}

export default variationsByKeyValue;
