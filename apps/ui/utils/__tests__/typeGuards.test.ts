// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { isString } from '../typeGuards';

describe('typeGuards', () => {
  describe('isString', () => {
    it('should return true for string value', () => {
      expect(isString('test')).toEqual(true);
      expect(isString('')).toEqual(true);
    });

    it('should return false for number value', () => {
      expect(isString(123)).toEqual(false);
    });
  });
});
