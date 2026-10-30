// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import valueToString from '../valueToString';

describe('valueToString', () => {
  it('should convert object to JSON string', () => {
    const obj = { key: 'value', number: 123 };
    const result = valueToString(obj);

    expect(result).toEqual('{"key":"value","number":123}');
  });

  it('should convert non object to string', () => {
    const result = valueToString(2);

    expect(result).toEqual('2');
  });
});
