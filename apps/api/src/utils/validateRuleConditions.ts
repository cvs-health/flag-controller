// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ARRAY_VALUE_OPERATORS } from 'shared-constants';
import { FieldErrorCode, RuleConditionType, type RuleCondition } from 'shared-types';

import { ValidationError } from '../errors/AppError.js';

function validateRuleConditions(conditions: RuleCondition[] | undefined, fieldPrefix = 'conditions') {
  const errors =
    conditions?.flatMap((condition, index) => {
      if (
        condition.type === RuleConditionType.Context &&
        ARRAY_VALUE_OPERATORS.includes(condition.operator) &&
        !Array.isArray(condition.values)
      ) {
        return [{ field: `${fieldPrefix}.${index}.values`, code: FieldErrorCode.Invalid }];
      }

      return [];
    }) ?? [];

  if (errors.length) {
    throw new ValidationError({
      message: 'List operators require array values',
      detail: `Values must be an array for ${ARRAY_VALUE_OPERATORS.join(', ')} conditions.`,
      errors,
    });
  }
}

export default validateRuleConditions;
