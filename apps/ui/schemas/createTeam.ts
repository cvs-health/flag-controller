// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

import { lowercaseKebabCasePattern } from '../constants/common';

export const createTeamSchema = z.object({
  teamName: z
    .string()
    .max(50, 'Team name must be 50 characters or less.')
    .min(1, 'Team name is required.')
    .regex(lowercaseKebabCasePattern, 'Format should follow a lowercase, kebab-case convention (ex. my-team-name).'),
});

export type CreateTeamForm = z.infer<typeof createTeamSchema>;
