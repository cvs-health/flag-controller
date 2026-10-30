// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import groupVariationsByChange from '../groupVariationsByChange';
import type { ParsedFeatureFlagVariation } from '../featureFlagVariationsFormDataToVariations';
import type { Variation } from '../../typings/variations';

describe('groupVariationsByChange', () => {
  it('groups created, updated, deleted, and unmodified variations', () => {
    const existingVariations: Variation[] = [
      {
        applicationName: 'app',
        createdAt: '2024-01-01T00:00:00.000Z',
        flagKey: 'flag-a',
        id: 'var-1',
        key: 'on',
        updatedAt: '2024-01-01T00:00:00.000Z',
        value: true,
      },
      {
        applicationName: 'app',
        createdAt: '2024-01-01T00:00:00.000Z',
        flagKey: 'flag-a',
        id: 'var-2',
        key: 'off',
        updatedAt: '2024-01-01T00:00:00.000Z',
        value: 'old-value',
      },
      {
        applicationName: 'app',
        createdAt: '2024-01-01T00:00:00.000Z',
        flagKey: 'flag-a',
        id: 'var-3',
        key: 'delete-me',
        updatedAt: '2024-01-01T00:00:00.000Z',
        value: 'x',
      },
    ];

    const parsedVariations: ParsedFeatureFlagVariation[] = [
      { id: 'var-1', key: 'on', value: 'true', created: false, removed: false },
      { id: 'var-2', key: 'off', value: 'new-value', created: false, removed: false },
      { id: 'var-3', key: 'delete-me', value: 'x', created: false, removed: true },
      { id: 'new-id', key: 'beta', value: '42', created: true, removed: false },
    ];

    const [created, updated, removed, unmodified] = groupVariationsByChange(parsedVariations, existingVariations);

    expect(created).toEqual([{ key: 'beta', value: '42' }]);
    expect(updated).toEqual([{ id: 'var-2', key: 'off', value: 'new-value' }]);
    expect(removed).toEqual(['var-3']);
    expect(unmodified).toEqual([{ id: 'var-1', key: 'on', value: 'true', created: false, removed: false }]);
  });
});
