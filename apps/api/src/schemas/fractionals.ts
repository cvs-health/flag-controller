// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FractionalType } from 'shared-types';

export const weightsSchema = {
  type: 'array',
  items: {
    type: 'array',
    items: [{ type: 'string' }, { type: 'number' }],
    additionalItems: false,
    minItems: 2,
    maxItems: 2,
  },
  minItems: 1,
} as const;
export const fractionalSchema = {
  type: 'object',
  properties: {
    createdAt: { type: 'string', format: 'date-time' },
    deletedAt: { type: ['string', 'null'], format: 'date-time' },
    id: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' },
    var: { type: ['string', 'null'] },
    type: {
      type: 'string',
      enum: [FractionalType.Contextual, FractionalType.WeightOnly],
    },
    weights: weightsSchema,
  },
} as const;
