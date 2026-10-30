// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';

export const featureFlagTypeSchema = {
  type: 'string',
  enum: [FeatureFlagType.Boolean, FeatureFlagType.Integer, FeatureFlagType.Object, FeatureFlagType.String],
} as const;

export const featureFlagSchema = {
  title: 'Feature flag',
  description: 'A feature flag',
  type: 'object',
  additionalProperties: false,
  properties: {
    applicationId: { type: 'string' },
    archived: { type: 'boolean', default: false },
    createdAt: { type: 'string', format: 'date-time' },
    deletedAt: { type: 'string', format: 'date-time', nullable: true },
    description: { type: 'string' },
    id: { type: 'string' },
    key: { type: 'string' },
    type: featureFlagTypeSchema,
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['applicationId', 'archived', 'createdAt', 'description', 'key', 'type', 'updatedAt'],
} as const;

export const featureFlagSchemaJoined = {
  title: 'Feature flag',
  description: 'A feature flag',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...featureFlagSchema.properties,
    applicationName: { type: 'string' },
  },
  required: [...featureFlagSchema.required, 'applicationName'],
} as const;

export const featureFlagTypesSchema = {
  type: 'array',
  items: featureFlagTypeSchema,
} as const;

export const updateFeatureFlagSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    description: featureFlagSchema.properties.description,
    archived: featureFlagSchema.properties.archived,
  },
  minProperties: 1,
} as const;

export const featureFlagWithEnvironmentListItemSchema = {
  title: 'Feature flags',
  description: 'Feature flag with environment status',
  type: 'object',
  additionalProperties: false,
  properties: {
    applicationName: { type: 'string' },
    applicationId: { type: 'string' },
    archived: featureFlagSchema.properties.archived,
    createdAt: { type: 'string', format: 'date-time' },
    enabled: { type: 'object', patternProperties: { '^.{1,}$': { type: 'boolean' } } },
    key: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' },
    type: featureFlagTypeSchema,
  },
  required: ['applicationId', 'archived', 'createdAt', 'enabled', 'key', 'updatedAt', 'type'],
} as const;
