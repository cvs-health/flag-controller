// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FlagVariationsTableColumns } from 'shared-types';
import { describe, expect, it } from 'vitest';

import variationKeyFromId from '../variationKeyFromId';

describe('variationKeyFromId', () => {
  const variations = [
    { id: 'var-1', key: 'on' },
    { id: 'var-2', key: 'off' },
  ] as FlagVariationsTableColumns[];

  it('returns the matching variation key when variation id exists', () => {
    expect(variationKeyFromId('var-2', variations)).toBe('off');
  });

  it('returns empty string when variation id does not exist', () => {
    expect(variationKeyFromId('missing-id', variations)).toBe('');
  });

  it('returns empty string when variation id is null', () => {
    expect(variationKeyFromId(null, variations)).toBe('');
  });
});
