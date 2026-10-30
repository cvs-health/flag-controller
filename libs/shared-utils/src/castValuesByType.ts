// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { RuleConditionValueType } from 'shared-types';

/**
 * Casts the values to the specified type.
 */
function castValuesByType(values: string[] | string, valuesType = RuleConditionValueType.String) {
  switch (valuesType) {
    case RuleConditionValueType.String:
      return Array.isArray(values) ? values.map((value) => String(value)) : String(values);
    case RuleConditionValueType.Number:
      return Array.isArray(values) ? values.map((value) => Number(value)) : Number(values);
    case RuleConditionValueType.Boolean:
      return Array.isArray(values) ? values.map((value) => value === 'true') : values === 'true';
    default:
      return values;
  }
}

export default castValuesByType;
