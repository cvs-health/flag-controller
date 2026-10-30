// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Clause, Operator, RuleConditionType, RuleConditionValueType, type ContextRuleCondition } from 'shared-types';
import { describe, expect, it } from 'vitest';

import genericCondition from '../genericCondition.js';

const variable = { var: 'user.attribute' };

const operatorCases: Record<Operator, { values: ContextRuleCondition['values']; expected: unknown }> = {
  [Operator.And]: { values: 'value', expected: { and: [variable, 'value'] } },
  [Operator.EndsWith]: { values: 'value', expected: { ends_with: [variable, 'value'] } },
  [Operator.NotEndsWith]: { values: 'value', expected: { '!ends_with': [variable, 'value'] } },
  [Operator.GreaterThan]: { values: 'value', expected: { '>': [variable, 'value'] } },
  [Operator.GreaterThanOrEqual]: { values: 'value', expected: { '>=': [variable, 'value'] } },
  [Operator.In]: { values: 'value', expected: { in: ['value', variable] } },
  [Operator.NotIn]: { values: 'value', expected: { '!': { in: ['value', variable] } } },
  [Operator.InList]: { values: ['us', 'ca'], expected: { in: [variable, ['us', 'ca']] } },
  [Operator.NotInList]: { values: [18, 21], expected: { '!': { in: [variable, [18, 21]] } } },
  [Operator.LessThan]: { values: 'value', expected: { '<': [variable, 'value'] } },
  [Operator.LessThanOrEqual]: { values: 'value', expected: { '<=': [variable, 'value'] } },
  [Operator.LooseEquals]: { values: 'value', expected: { '==': [variable, 'value'] } },
  [Operator.LooseInequality]: { values: 'value', expected: { '!=': [variable, 'value'] } },
  [Operator.Major]: { values: 'value', expected: { '^': [variable, 'value'] } },
  [Operator.Minor]: { values: 'value', expected: { '~': [variable, 'value'] } },
  [Operator.None]: { values: 'value', expected: { none: [variable, 'value'] } },
  [Operator.Some]: { values: 'value', expected: { some: [variable, 'value'] } },
  [Operator.Not]: { values: 'value', expected: { '!': [variable, 'value'] } },
  [Operator.Or]: { values: 'value', expected: { or: [variable, 'value'] } },
  [Operator.StartsWith]: { values: 'value', expected: { starts_with: [variable, 'value'] } },
  [Operator.NotStartsWith]: { values: 'value', expected: { '!starts_with': [variable, 'value'] } },
  [Operator.StrictEquals]: { values: 'value', expected: { '===': [variable, 'value'] } },
  [Operator.StrictInequality]: { values: 'value', expected: { '!==': [variable, 'value'] } },
};

describe('genericCondition', () => {
  it.each(Object.values(Operator))('converts the %s operator', (operator) => {
    const { values, expected } = operatorCases[operator];
    const condition: ContextRuleCondition = {
      attribute: 'attribute',
      clause: Clause.If,
      context: 'user',
      operator,
      type: RuleConditionType.Context,
      values,
      valuesType:
        Array.isArray(values) && typeof values[0] === 'number'
          ? RuleConditionValueType.Number
          : RuleConditionValueType.String,
    };

    expect(genericCondition(condition)).toEqual(expected);
  });
});
