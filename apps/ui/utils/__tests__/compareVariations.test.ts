// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import compareVariations from '../compareVariations';

describe('compareVariations', () => {
  it('should return empty changes for identical variations', () => {
    const variation1 = { key: 'enabled', value: false };
    const variation2 = { key: 'enabled', value: false };
    // @ts-ignore we don't need the whole variation
    const result = compareVariations(variation1, variation2);

    expect(result).toEqual({
      add: [],
      change: [],
      remove: [],
    });
  });

  it('should detect changed variations', () => {
    const variation1 = { key: 'enabled', value: false };
    const variation2 = { key: 'enabled2', value: true };
    // @ts-ignore we don't need the whole variation
    const result = compareVariations(variation1, variation2);

    expect(result.change).toEqual([
      {
        property: 'key',
        oldValue: 'enabled',
        newValue: 'enabled2',
      },
      {
        property: 'value',
        oldValue: 'false',
        newValue: 'true',
      },
    ]);
  });
});
