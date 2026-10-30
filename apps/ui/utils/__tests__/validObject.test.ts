// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import validObject from '../validObject';

describe('validObject', () => {
  it('accepts empty and populated objects', () => {
    expect(validObject('{}')).toBe(true);
    expect(validObject('{"key":"value"}')).toBe(true);
  });

  it('rejects invalid object and values that are not objects', () => {
    expect(validObject('not object')).toBe(false);
    expect(validObject('null')).toBe(false);
    expect(validObject('[]')).toBe(false);
    expect(validObject('"text"')).toBe(false);
    expect(validObject('1')).toBe(false);
    expect(validObject('true')).toBe(false);
  });
});
