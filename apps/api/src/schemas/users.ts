// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export const userSchema = {
  type: 'object',
  properties: {
    createdAt: { type: 'string', format: 'date-time' },
    email: { type: 'string' },
    id: { type: 'string' },
    name: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;
