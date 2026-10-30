// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import listById from '../listById.js';

describe('listById', () => {
  it('should convert a list to an object with ids as keys', () => {
    const list = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];

    expect(listById(list)).toEqual({
      '1': { id: '1', name: 'Item 1' },
      '2': { id: '2', name: 'Item 2' },
    });
  });
});
