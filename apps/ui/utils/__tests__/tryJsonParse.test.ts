// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import tryJsonParse from '../tryJsonParse';

describe('tryJsonParse', () => {
  it('should parse valid JSON string', () => {
    const jsonString = '{"key": "value", "number": 123}';
    const result = tryJsonParse(jsonString);

    expect(result).toEqual({
      key: 'value',
      number: 123,
    });
  });

  it('should return original value if it cant parse', () => {
    const invalidJson = 27;
    const result = tryJsonParse(invalidJson);

    expect(result).toEqual(invalidJson);
  });
});
