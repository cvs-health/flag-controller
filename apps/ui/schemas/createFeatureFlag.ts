// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';
import { z } from 'zod';

import { lowercaseKebabCasePattern } from '../constants/common';
import validObject from '../utils/validObject';

const variationKeySchema = z
  .string()
  .min(1, 'Variation key is required.')
  .regex(lowercaseKebabCasePattern, 'Use lowercase letters, numbers, and hyphens only (e.g., enabled).');

export const variationValueSchema = z.string().min(1, 'Variation value is required.');
export const objectVariationValueSchema = variationValueSchema.refine(validObject, 'Must be a valid JSON object.');
export const createFeatureFlagFieldsSchema = z.object({
  applicationId: z.string().min(1, 'Application is required.'),
  defaultVariationKey: z.string().min(1, 'Default variation is required.'),
  description: z.string().min(1, 'Description is required.'),
  key: z
    .string()
    .min(1, 'Flag key is required.')
    .regex(lowercaseKebabCasePattern, 'Use lowercase letters, numbers, and hyphens only (e.g., my-feature-flag).'),
  type: z.enum(FeatureFlagType),
  variationKey1: variationKeySchema,
  variationKey2: variationKeySchema,
  variationValue1: variationValueSchema,
  variationValue2: variationValueSchema,
});
export const createFeatureFlagSchema = createFeatureFlagFieldsSchema.superRefine((form, context) => {
  if (form.type === FeatureFlagType.Object) {
    for (const field of ['variationValue1', 'variationValue2'] as const) {
      if (!objectVariationValueSchema.safeParse(form[field]).success) {
        context.addIssue({
          code: 'custom',
          message: 'Must be a valid JSON object.',
          path: [field],
        });
      }
    }
  }

  if (form.variationKey1 === form.variationKey2) {
    context.addIssue({
      code: 'custom',
      message: 'Variation keys must be unique.',
      path: ['variationKey2'],
    });
  }

  if (form.defaultVariationKey !== form.variationKey1 && form.defaultVariationKey !== form.variationKey2) {
    context.addIssue({
      code: 'custom',
      message: 'Default variation must match one of the variation keys.',
      path: ['defaultVariationKey'],
    });
  }
});

export type CreateFeatureFlagForm = z.infer<typeof createFeatureFlagFieldsSchema>;
