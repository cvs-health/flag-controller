// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export const segmentSchema = {
  title: 'Segment',
  description: 'A segment entity',
  type: 'object',
  additionalProperties: false,
  properties: {
    applicationId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    deletedAt: { type: 'string', format: 'date-time', nullable: true },
    description: { type: 'string' },
    id: { type: 'string' },
    key: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['applicationId', 'createdAt', 'description', 'id', 'key', 'updatedAt', 'deletedAt'],
} as const;

export const segmentSchemaJoined = {
  title: 'Segment',
  description: 'A segment entity with joins',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...segmentSchema.properties,
    applicationName: { type: 'string' },
  },
  required: ['applicationId', 'applicationName', 'createdAt', 'description', 'id', 'key', 'updatedAt', 'deletedAt'],
} as const;

export const createSegmentSchema = {
  type: 'object',
  properties: {
    applicationId: segmentSchema.properties.applicationId,
    description: segmentSchema.properties.description,
    key: segmentSchema.properties.key,
  },
  required: ['applicationId', 'description', 'key'],
} as const;

export const segmentSchemaListItem = {
  title: 'Segment',
  description: 'A segment entity with joins and flag target count',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...segmentSchemaJoined.properties,
    flagTargetCount: { type: 'number' },
  },
  required: [...segmentSchemaJoined.required],
} as const;

export const segmentListSchema = {
  type: 'array',
  items: segmentSchemaListItem,
} as const;
