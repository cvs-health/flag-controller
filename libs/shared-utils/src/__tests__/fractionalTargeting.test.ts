// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FractionalWeight } from 'shared-types';
import { describe, expect, it } from 'vitest';

import fractionalTargeting from '../fractionalTargeting.js';

describe('fractionalTargeting', () => {
  const weights: FractionalWeight[] = [
    ['variation-key', 10],
    ['variation-key-2', 20],
  ];

  it('should provide a fractional targeting', () => {
    expect(fractionalTargeting(weights, 'user.name')).toEqual({
      fractional: [
        {
          cat: [
            {
              var: '$flagd.flagKey',
            },
            {
              var: 'user.name',
            },
          ],
        },
        ...weights,
      ],
    });
  });

  it('should provide a fractional targeting without a var', () => {
    expect(fractionalTargeting(weights)).toEqual({
      fractional: weights,
    });
  });
});
