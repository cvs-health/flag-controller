// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export const flagEnvironmentSchemaJoined = {
  type: 'object',
  properties: {
    createdAt: { type: 'string', format: 'date-time' },
    defaultServeId: { type: 'string' },
    defaultServeKey: { type: 'string', nullable: true },
    enabled: { type: 'boolean' },
    environmentId: { type: 'string' },
    flagId: { type: 'string' },
    flag: {
      type: 'object',
      properties: {
        applicationId: { type: 'string' },
        key: { type: 'string' },
      },
    },
    updatedAt: { type: 'string', format: 'date-time' },
    environmentKey: { type: 'string' },
  },
  required: [
    'createdAt',
    'defaultServeId',
    'defaultServeKey',
    'enabled',
    'environmentId',
    'environmentKey',
    'flag',
    'flagId',
    'updatedAt',
  ],
} as const;
export const flagEnvironmentSchema = {
  type: 'object',
  properties: {
    flagId: { type: 'string' },
    environmentId: { type: 'string' },
    enabled: { type: 'boolean' },
    defaultServeId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;
export const updateflagEnvironmentSchema = {
  type: 'object',
  properties: {
    defaultServeId: { type: 'string' },
    enabled: { type: 'boolean' },
  },
  minProperties: 1,
} as const;
