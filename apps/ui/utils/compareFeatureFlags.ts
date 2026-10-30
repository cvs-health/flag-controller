// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { isEqual } from 'es-toolkit/predicate';
import valueToString from './valueToString';
import type { ChangeDataTypes } from '../typings/audits';

const ignoredProperties = ['id', 'createdAt', 'updatedAt', 'applicationName'];

/**
 * Compare each of the properties of the feature flags and return the differences
 * */
function compareFeatureFlags(featureFlag1: ChangeDataTypes['flag'], featureFlag2: ChangeDataTypes['flag']) {
  const differences = [];

  for (const key in featureFlag1) {
    if (ignoredProperties.includes(key)) {
      continue;
    }

    const oldValue = featureFlag1[key as keyof typeof featureFlag1];
    const newValue = featureFlag2[key as keyof typeof featureFlag2];

    if (!isEqual(oldValue, newValue)) {
      differences.push({
        property: key,
        oldValue: valueToString(oldValue),
        newValue: valueToString(newValue),
      });
    }
  }

  return differences;
}

export default compareFeatureFlags;
