// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export const attributesSchema = {
  type: 'array',
  items: { type: 'string' },
} as const;

export const contextSchema = {
  type: 'object',
  properties: {
    applicationId: { type: 'string' },
    attributes: attributesSchema,
    id: { type: 'string' },
    key: { type: 'string' },
  },
  required: ['applicationId', 'attributes', 'id', 'key'],
} as const;
