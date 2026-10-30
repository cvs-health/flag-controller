// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import updateSearchParams from '../updateSearchParams';

describe('updateSearchParams', () => {
  it('should update search params with provided updates and return the correct string', () => {
    const initialParams = new URLSearchParams('existing=value&keep=this');
    const updates: [string, string][] = [
      ['new', 'parameter'],
      ['existing', 'updated'],
    ];
    // @ts-ignore mocking ReadonlyURLSearchParams
    const result = updateSearchParams(initialParams, updates);

    expect(result).toEqual('existing=updated&keep=this&new=parameter');
  });
});
