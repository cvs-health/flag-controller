// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { isEqual } from 'es-toolkit/predicate';

import valueToString from './valueToString';
import type { ChangeDataTypes } from '../typings/audits';

const ignoredProperties = ['defaultServeId'];

/**
 * Compare each of the properties of the feature flag environments and return the differences
 * */
function compareFeatureFlagEnvironments(
  featureFlag1: ChangeDataTypes['flagEnvironment'],
  featureFlag2: ChangeDataTypes['flagEnvironment'],
) {
  const differences = [];

  for (const key in featureFlag1) {
    if (ignoredProperties.includes(key)) {
      continue;
    }

    const oldValue = featureFlag1[key as keyof typeof featureFlag1];
    const newValue = featureFlag2[key as keyof typeof featureFlag2];

    if (!isEqual(oldValue, newValue)) {
      // Special case for enabled property, which is a boolean
      if (key === 'enabled') {
        differences.push({
          property: key,
          oldValue: oldValue ? 'on' : 'off',
          newValue: newValue ? 'on' : 'off',
        });

        continue;
      }

      differences.push({
        property: key,
        oldValue: valueToString(oldValue),
        newValue: valueToString(newValue),
      });
    }
  }

  return differences;
}

export default compareFeatureFlagEnvironments;
