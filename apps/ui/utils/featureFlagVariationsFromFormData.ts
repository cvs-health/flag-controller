// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagType, FeatureFlagVariation } from 'shared-types';
import { variationValueBasedOnFeatureFlagType } from 'shared-utils';

interface FormDataVariations {
  [key: string]: FormDataEntryValue | null;
}
function featureFlagVariationsFromFormData(
  formDataVariations: FormDataVariations,
  featureFlagType: FeatureFlagType,
): FeatureFlagVariation<FeatureFlagType> {
  return Object.entries(formDataVariations).reduce((variations, [variationKey, variationValue]) => {
    const value = variationValueBasedOnFeatureFlagType(featureFlagType, variationValue);
    return {
      ...variations,
      [variationKey]: value,
    };
  }, {});
}

export default featureFlagVariationsFromFormData;
