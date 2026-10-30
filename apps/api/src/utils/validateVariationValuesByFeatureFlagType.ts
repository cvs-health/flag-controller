// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType, FieldErrorCode } from 'shared-types';
import { ValidationError } from '../errors/AppError.js';

function valueMatchesFeatureFlagType(value: unknown, type: FeatureFlagType) {
  switch (type) {
    case FeatureFlagType.Boolean:
      return typeof value === 'boolean';
    case FeatureFlagType.Integer:
      return typeof value === 'number' && Number.isFinite(value);
    case FeatureFlagType.String:
      return typeof value === 'string';
    case FeatureFlagType.Object:
      return value !== null && typeof value === 'object' && !Array.isArray(value);
    default:
      return false;
  }
}

function validateVariationValuesByFeatureFlagType(
  featureFlagType: FeatureFlagType,
  variations: Record<string, unknown>,
) {
  const valuesMatchType = Object.values(variations).every((value) =>
    valueMatchesFeatureFlagType(value, featureFlagType),
  );
  if (!valuesMatchType) {
    const variationsAndValueTypes = Object.entries(variations)
      .map(([key, value]) => `${key}: ${typeof value}`)
      .join(', ');

    throw new ValidationError({
      message: `Variation values must match the feature flag type '${featureFlagType}', got ${variationsAndValueTypes}`,
      detail: `Variation values must match the feature flag type '${featureFlagType}'.`,
      errors: [{ field: 'variations', code: FieldErrorCode.Invalid }],
      context: { featureFlagType, variationsAndValueTypes },
    });
  }
}

export default validateVariationValuesByFeatureFlagType;
