// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

const descriptionSchema = z.string().min(1, 'Description is required.');

export const updateFeatureFlagDetailsSchema = z.object({
  description: descriptionSchema,
  featureFlagId: z.string().min(1),
});

export const updateSegmentDetailsSchema = z.object({
  description: descriptionSchema,
  segmentId: z.string().min(1),
});

export type UpdateFeatureFlagDetailsForm = z.infer<typeof updateFeatureFlagDetailsSchema>;
export type UpdateSegmentDetailsForm = z.infer<typeof updateSegmentDetailsSchema>;
