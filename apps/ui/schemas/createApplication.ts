// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

import { lowercaseKebabCasePattern } from '../constants/common';

export const createApplicationSchema = z.object({
  applicationName: z
    .string()
    .max(50, 'Application name must be 50 characters or less.')
    .min(1, 'You must add an application name.')
    .regex(lowercaseKebabCasePattern, 'Use lowercase letters, numbers, and hyphens only (e.g., my-app-name).'),
  teamId: z.string().min(1, 'You must select a team.'),
});

export type CreateApplicationForm = z.infer<typeof createApplicationSchema>;
