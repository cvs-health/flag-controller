// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export const teamSchema = {
  type: 'object',
  properties: {
    createdAt: { type: 'string', format: 'date-time' },
    deletedAt: { type: 'string', nullable: true, format: 'date-time' },
    id: { type: 'string' },
    memberCount: { type: 'number' },
    name: { type: 'string' },
    organizationId: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;
