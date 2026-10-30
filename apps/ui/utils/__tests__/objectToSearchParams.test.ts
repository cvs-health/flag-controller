// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import objectToSearchParams from '../objectToSearchParams';

describe('objectToSearchParams', () => {
  it('should handle array values by appending multiple parameters', () => {
    const input = { key1: ['value1', 'value2'], key2: 'value3' };
    const result = objectToSearchParams(input);
    expect(result).toBe('key1=value1&key1=value2&key2=value3');
  });
});
