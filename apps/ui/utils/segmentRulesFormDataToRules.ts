// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  Clause,
  type Operator,
  RuleConditionType,
  RuleConditionValueType,
  type ContextRuleCondition,
  type RulesTableColumns,
} from 'shared-types';

import type { ParsedFeatureFlagRule } from './featureFlagRulesFormDataToRules';

function getContextConditions(formData: FormData): ContextRuleCondition[] {
  const operators = formData.getAll('operator') as Operator[];
  const attributes = formData.getAll('attribute') as string[];
  const contexts = formData.getAll('context') as string[];
  const values = formData.getAll('values') as string[];
  const valuesType = formData.getAll('valuesType') as RuleConditionValueType[];

  return operators.map((operator, conditionIndex) => {
    return {
      attribute: attributes[conditionIndex] || '',
      clause: Clause.If,
      context: contexts[conditionIndex] || '',
      operator,
      type: RuleConditionType.Context,
      values: values[conditionIndex] || '',
      valuesType: valuesType[conditionIndex] || RuleConditionValueType.String,
    };
  });
}

/**
 * Segment rules currently only support a single rule with context-based conditions.
 */
function segmentRulesFormDataToRules(formData: FormData): ParsedSegmentRule[] {
  return [
    {
      conditions: getContextConditions(formData),
      environmentId: formData.get('environmentId') as string,
      id: formData.get('id') as string,
      key: formData.get('key') as string,
      created: formData.get('created') === 'true',
      removed: false,
      orderPosition: 0,
      segmentId: formData.get('segmentId') as string,
    } as ParsedSegmentRule,
  ];
}

export type ParsedSegmentRule = ParsedFeatureFlagRule & {
  segmentId: NonNullable<RulesTableColumns['segmentId']>;
};

export default segmentRulesFormDataToRules;
