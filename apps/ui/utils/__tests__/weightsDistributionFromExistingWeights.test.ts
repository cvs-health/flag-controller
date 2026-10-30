// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FlagVariationsTableColumns, FractionalWeight } from 'shared-types';
import { describe, expect, it } from 'vitest';

import weightsDistributionFromExistingWeights from '../weightsDistributionFromExistingWeights';

describe('weightsDistributionFromExistingWeights', () => {
  it('uses existing weights where ids match and defaults missing ids to zero', () => {
    const variations = [{ id: 'var-1' }, { id: 'var-2' }, { id: 'var-3' }] as FlagVariationsTableColumns[];
    const weights: FractionalWeight[] = [
      ['var-1', 20],
      ['var-2', 80],
    ];

    expect(weightsDistributionFromExistingWeights(variations, weights)).toEqual([
      ['var-1', 20],
      ['var-2', 80],
      ['var-3', 0],
    ]);
  });

  it('distributes evenly when no existing weights are provided', () => {
    const variations = [{ id: 'var-1' }, { id: 'var-2' }, { id: 'var-3' }] as FlagVariationsTableColumns[];

    expect(weightsDistributionFromExistingWeights(variations, [])).toEqual([
      ['var-1', 100 / 3],
      ['var-2', 100 / 3],
      ['var-3', 100 / 3],
    ]);
  });
});
