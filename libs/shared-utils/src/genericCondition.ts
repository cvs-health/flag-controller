// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Operator, type ContextRuleCondition } from 'shared-types';

import conditionVariable from './conditionVariable.js';

function genericCondition(condition: ContextRuleCondition) {
  const variable = { var: conditionVariable(condition.context, condition.attribute) };
  const isInOperator = condition.operator === Operator.In || condition.operator === Operator.NotIn;
  const isListOperator = condition.operator === Operator.InList || condition.operator === Operator.NotInList;

  // Used strictly for string matches with non-array values even though flagd's in operator can handle arrays
  if (isInOperator) {
    return condition.operator === Operator.In
      ? { in: [condition.values, variable] }
      : { '!': { in: [condition.values, variable] } };
  }

  if (isListOperator && Array.isArray(condition.values)) {
    const inListOperator = condition.operator === Operator.InList;

    if (inListOperator) {
      return { in: [variable, condition.values] };
    }

    return { '!': { in: [variable, condition.values] } };
  }

  return { [condition.operator]: [variable, condition.values] };
}

export default genericCondition;
