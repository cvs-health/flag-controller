// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { RuleConditionValueType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import castValuesByType from '../castValuesByType.js';

describe('castValuesByType', () => {
  it('should cast values to the proper type', () => {
    expect(castValuesByType('hello', RuleConditionValueType.String)).toBe('hello');
    expect(castValuesByType(['hello', 'world'], RuleConditionValueType.String)).toEqual(['hello', 'world']);
    expect(castValuesByType('123', RuleConditionValueType.Number)).toBe(123);
    expect(castValuesByType(['123', '456'], RuleConditionValueType.Number)).toEqual([123, 456]);
    expect(castValuesByType('true', RuleConditionValueType.Boolean)).toBe(true);
    expect(castValuesByType('false', RuleConditionValueType.Boolean)).toBe(false);
    expect(castValuesByType('anything', RuleConditionValueType.Boolean)).toBe(false);
    expect(castValuesByType(['true', 'false', 'true'], RuleConditionValueType.Boolean)).toEqual([true, false, true]);
    expect(castValuesByType(['true', 'anything'], RuleConditionValueType.Boolean)).toEqual([true, false]);
  });
});
