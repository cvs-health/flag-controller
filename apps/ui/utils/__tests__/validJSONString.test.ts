// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import validJSONString from '../validJSONString';

describe('validJSONString', () => {
  it('should return true for valid JSON', () => {
    const validJson = '{"key": "value", "number": 123}';

    expect(validJSONString(validJson)).toEqual(true);
  });

  it('should return false for invalid JSON', () => {
    const invalidJson = '';

    expect(validJSONString(invalidJson)).toEqual(false);
  });
});
