// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import type { RuleConditionWithId } from '../../typings/rules';
import generateConditionId from '../generateConditionId';

describe('generateConditionId', () => {
  it('should generate an id from the current condition index when there are no existing conditions', () => {
    expect(generateConditionId('rule-id-1', 0)).toBe('rule-id-1-0');
  });

  it('should generate the next id after the greatest existing condition id suffix', () => {
    const conditions = [{ id: 'rule-id-1-0' }, { id: 'rule-id-1-3' }] as RuleConditionWithId[];

    expect(generateConditionId('rule-id-1', conditions.length, conditions)).toBe('rule-id-1-4');
  });
});
