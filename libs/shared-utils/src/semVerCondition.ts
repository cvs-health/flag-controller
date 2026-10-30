// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ContextRuleCondition } from 'shared-types';

import conditionVariable from './conditionVariable.js';

function semVerCondition(condition: ContextRuleCondition) {
  return {
    [condition.clause]: [
      {
        var: conditionVariable(condition.context, condition.attribute),
      },
      condition.operator,
      condition.values,
    ],
  };
}

export default semVerCondition;
