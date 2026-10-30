// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export const applicationSchema = {
  type: 'object',
  properties: {
    createdAt: { type: 'string', format: 'date-time' },
    deletedAt: { type: 'string', format: 'date-time', nullable: true },
    description: { type: 'string', nullable: true },
    id: { type: 'string' },
    name: { type: 'string' },
    teamId: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'teamId', 'name', 'description', 'createdAt', 'updatedAt', 'deletedAt'],
} as const;

export const applicationSchemaJoined = {
  title: 'Application',
  description: 'An application entity with joins',
  type: 'object',
  properties: {
    ...applicationSchema.properties,
    teamName: { type: 'string', nullable: true },
  },
  required: ['id', 'teamId', 'teamName', 'name', 'description', 'createdAt', 'updatedAt', 'deletedAt'],
} as const;
