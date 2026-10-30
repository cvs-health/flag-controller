// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FractionalType, type FractionalsTableColumns } from 'shared-types';
import { describe, expect, it } from 'vitest';

import fractionalWeightsWithVariationKeys from '../fractionalWeightsWithVariationKeys.js';

describe('fractionalWeightsWithVariationKeys', () => {
  const fractional: FractionalsTableColumns = {
    createdAt: '',
    deletedAt: null,
    id: 'fractional-id',
    type: FractionalType.Contextual,
    updatedAt: '',
    var: 'user.country',
    weights: [
      ['variation-id', 25],
      ['variation-id-2', 75],
    ],
  };

  it('should replace variation IDs with variation keys', () => {
    const variationKeysById = new Map([
      ['variation-id', 'red'],
      ['variation-id-2', 'blue'],
    ]);

    expect(fractionalWeightsWithVariationKeys(variationKeysById, fractional)).toEqual({
      ...fractional,
      weights: [
        ['red', 25],
        ['blue', 75],
      ],
    });
  });

  it('should use an empty key when a variation ID is not mapped', () => {
    const variationKeysById = new Map<string, string>();

    expect(fractionalWeightsWithVariationKeys(variationKeysById, fractional).weights).toEqual([
      ['', 25],
      ['', 75],
    ]);
  });

  it('should preserve an empty weights list', () => {
    const variationKeysById = new Map<string, string>();
    const emptyFractional = { ...fractional, weights: [] };

    expect(fractionalWeightsWithVariationKeys(variationKeysById, emptyFractional)).toEqual(emptyFractional);
  });
});
