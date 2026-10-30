// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagType } from 'shared-types';
import { variationValueBasedOnFeatureFlagType } from 'shared-utils';

import type { UpdatedVariation } from '../typings/variations';

interface BaseFormDataVariation {
  created: boolean;
  removed: boolean;
}

export type ParsedFeatureFlagVariation = UpdatedVariation & BaseFormDataVariation;

/**
 * Since this function is specific to the feature flag variations form, we can assume the structure of the FormData
 * and directly map the values to the appropriate variation properties.
 * Every getAll will return the values as they are rendered to the DOM, so the order will be preserved.
 */
function featureFlagVariationsFormDataToVariations(
  formData: FormData,
  featureFlagType: FeatureFlagType,
): ParsedFeatureFlagVariation[] {
  const variationKeys = formData.getAll('key') as string[];
  const variationIds = formData.getAll('id') as string[];
  const variationValues = formData.getAll('value');
  const variationRemovals = formData.getAll('removed');
  const variationCreations = formData.getAll('created');
  const variations = variationIds.map((id, index) => {
    return {
      id,
      key: variationKeys[index] as string,
      value: variationValueBasedOnFeatureFlagType(featureFlagType, variationValues[index]),
      removed: variationRemovals[index] === 'true',
      created: variationCreations[index] === 'true',
    };
  });

  return variations;
}

export default featureFlagVariationsFormDataToVariations;
