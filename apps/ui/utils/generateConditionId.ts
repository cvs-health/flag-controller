// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { RuleConditionWithId } from '../typings/rules';

function generateConditionId(ruleId: string, currentConditionIndex: number, conditions: RuleConditionWithId[] = []) {
  if (conditions.length) {
    const conditionIdPrefix = `${ruleId}-`;
    const maxConditionIdSuffix = conditions.reduce((max, condition) => {
      if (!condition.id.startsWith(conditionIdPrefix)) {
        return max;
      }

      const [, suffix = '0'] = condition.id.split(conditionIdPrefix);
      const conditionIdSuffix = Number(suffix);

      return Number.isInteger(conditionIdSuffix) ? Math.max(max, conditionIdSuffix) : max;
    }, currentConditionIndex - 1);

    return `${ruleId}-${maxConditionIdSuffix + 1}`;
  }

  return `${ruleId}-${currentConditionIndex}`;
}

export default generateConditionId;
