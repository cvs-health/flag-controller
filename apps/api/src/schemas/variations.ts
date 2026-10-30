// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export const variationSchema = {
  type: 'object',
  properties: {
    createdAt: { type: 'string', format: 'date-time' },
    deletedAt: { type: ['string', 'null'], format: 'date-time' },
    flagId: { type: 'string' },
    id: { type: 'string' },
    key: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' },
    value: {
      // object needs additionalProperties to be true or fast-json-stringify will convert it to `{}`
      anyOf: [
        { type: 'boolean' },
        { type: 'string' },
        { type: 'number' },
        { type: 'object', additionalProperties: true },
      ],
    },
  },
  required: ['id', 'key', 'value', 'flagId', 'createdAt', 'updatedAt'],
} as const;
export const createVariationSchema = {
  type: 'object',
  properties: {
    flagId: variationSchema.properties.flagId,
    key: variationSchema.properties.key,
    value: variationSchema.properties.value,
  },
  required: ['flagId', 'key', 'value'],
} as const;
export const updateVariationSchema = {
  type: 'object',
  properties: {
    key: variationSchema.properties.key,
    value: variationSchema.properties.value,
  },
  minProperties: 1,
  additionalProperties: false,
} as const;
