// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

import { lowercaseKebabCasePattern } from '../constants/common';

export const createSegmentSchema = z.object({
  applicationId: z.string().min(1, 'Application is required.'),
  description: z.string().min(1, 'Description is required.'),
  key: z
    .string()
    .min(1, 'Segment key is required.')
    .regex(lowercaseKebabCasePattern, 'Use lowercase letters, numbers, and hyphens only (e.g., my-segment).'),
});

export type CreateSegmentForm = z.infer<typeof createSegmentSchema>;
