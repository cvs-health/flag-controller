// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';

function variationValueBasedOnFeatureFlagType(
  type: FeatureFlagType,
  value?: string | number | boolean | object | null,
) {
  if (type === FeatureFlagType.Boolean) {
    return typeof value === 'string' ? value === 'true' : value;
  }
  if (type === FeatureFlagType.Integer) {
    return Number(value);
  }
  if (type === FeatureFlagType.Object) {
    if (typeof value === 'object') {
      return value;
    }

    if (typeof value === 'string' && value) {
      return JSON.parse(value);
    }

    return {};
  }
  return value ?? '';
}

export default variationValueBasedOnFeatureFlagType;
