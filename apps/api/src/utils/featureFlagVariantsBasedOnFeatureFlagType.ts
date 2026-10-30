// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagType, FeatureFlagVariation } from 'shared-types';
import { variationValueBasedOnFeatureFlagType } from 'shared-utils';

function featureFlagVariantsBasedOnFeatureFlagType<T extends FeatureFlagType>(
  variations: FeatureFlagVariation<T>,
  featureFlagType: T,
) {
  return Object.entries(variations).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: variationValueBasedOnFeatureFlagType(featureFlagType, value),
    }),
    {},
  );
}

export default featureFlagVariantsBasedOnFeatureFlagType;
