// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { EnvironmentKey } from 'shared-types';

export const environmentSchema = {
  type: 'object',
  properties: {
    applicationId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    id: { type: 'string' },
    key: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const environmentsSchema = {
  type: 'array',
  items: { type: 'string', enum: Object.values(EnvironmentKey) },
} as const;
