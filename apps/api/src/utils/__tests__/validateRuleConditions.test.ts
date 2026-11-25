// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Clause, FieldErrorCode, RuleConditionType, RuleConditionValueType } from 'shared-types';
import { ARRAY_VALUE_OPERATORS } from 'shared-constants';
import { describe, expect, it } from 'vitest';

import validateRuleConditions from '../validateRuleConditions.js';

describe('validateRuleConditions', () => {
  it.each(ARRAY_VALUE_OPERATORS)('rejects non-array values for %s', (operator) => {
    expect(() =>
      validateRuleConditions([
        {
          clause: Clause.If,
          context: 'user',
          operator,
          type: RuleConditionType.Context,
          values: 'value',
          valuesType: RuleConditionValueType.String,
        },
      ]),
    ).toThrow(
      expect.objectContaining({
        name: 'ValidationError',
        errors: [{ field: 'conditions.0.values', code: FieldErrorCode.Invalid }],
      }),
    );
  });

  it.each(ARRAY_VALUE_OPERATORS)('accepts array values for %s', (operator) => {
    expect(() =>
      validateRuleConditions([
        {
          clause: Clause.If,
          context: 'user',
          operator,
          type: RuleConditionType.Context,
          values: ['value'],
          valuesType: RuleConditionValueType.String,
        },
      ]),
    ).not.toThrow();
  });
});
