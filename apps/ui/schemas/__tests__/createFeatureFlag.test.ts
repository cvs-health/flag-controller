// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createFeatureFlagSchema, objectVariationValueSchema } from '../createFeatureFlag';

const validForm = {
  applicationId: 'application-id',
  defaultVariationKey: 'enabled',
  description: 'description',
  key: 'feature-flag-key',
  type: FeatureFlagType.Object,
  variationKey1: 'enabled',
  variationKey2: 'disabled',
  variationValue1: '{}',
  variationValue2: '{}',
};

describe('createFeatureFlagSchema', () => {
  it('validates object variation values using the shared field rules', () => {
    expect(objectVariationValueSchema.safeParse('not json').success).toBe(false);
    expect(objectVariationValueSchema.safeParse('{}').success).toBe(true);
    expect(objectVariationValueSchema.safeParse('{"key":"value"}').success).toBe(true);
    expect(objectVariationValueSchema.safeParse('null').success).toBe(false);
    expect(objectVariationValueSchema.safeParse('[]').success).toBe(false);
    expect(objectVariationValueSchema.safeParse('"text"').success).toBe(false);
    expect(objectVariationValueSchema.safeParse('1').success).toBe(false);
    expect(objectVariationValueSchema.safeParse('true').success).toBe(false);
  });

  it('reports cross-field errors on the relevant fields', () => {
    const result = createFeatureFlagSchema.safeParse({
      ...validForm,
      variationKey2: 'enabled',
      defaultVariationKey: 'missing',
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(z.flattenError(result.error).fieldErrors).toMatchObject({
      variationKey2: ['Variation keys must be unique.'],
      defaultVariationKey: ['Default variation must match one of the variation keys.'],
    });
  });
});
