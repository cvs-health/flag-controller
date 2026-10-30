// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Clause, Operator, RuleConditionType, RuleConditionValueType, RuleServeType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { parseFeatureFlagRule } from '../parseFeatureFlagRule';

describe('parseFeatureFlagRule', () => {
  it('should properly convert one rule from form data', () => {
    const formData = new FormData();
    const condition = {
      attribute: 'country',
      clause: Clause.If,
      context: 'user',
      id: 'condition-id',
      operator: Operator.In,
      type: RuleConditionType.Context,
      values: 'US',
      valuesType: RuleConditionValueType.String,
    };
    const rule = {
      conditions: [condition],
      environmentId: 'environment-id',
      flagId: 'flag-id',
      id: 'rule-id',
      key: 'rule-key',
      created: true,
      orderPosition: 0,
      removed: false,
      serve: null,
      serveVariationId: 'variation-id',
      serveFractionalId: null,
    };

    formData.append('flagId', rule.flagId);
    formData.append('environmentId', rule.environmentId);
    formData.append('key', rule.key);
    formData.append('id', rule.id);
    formData.append('removed', String(rule.removed));
    formData.append('created', String(rule.created));
    formData.append('serveType', RuleServeType.Variation);
    formData.append('serveId', rule.serveVariationId);
    formData.append(`${condition.id}-attribute`, condition.attribute || '');
    formData.append(`${condition.id}-context`, condition.context);
    formData.append(`${condition.id}-values`, condition.values);
    formData.append(`${condition.id}-valuesType`, condition.valuesType);
    formData.append(`${condition.id}-clause`, condition.clause);
    formData.append(`${condition.id}-conditionType`, condition.type);
    formData.append(`${condition.id}-operator`, condition.operator);
    formData.append(`${rule.id}-conditionId`, condition.id);

    expect(parseFeatureFlagRule(formData, rule.key, 0)).toEqual({
      ...rule,
      conditions: [
        {
          attribute: 'country',
          clause: Clause.If,
          context: 'user',
          id: 'condition-id',
          operator: Operator.In,
          type: RuleConditionType.Context,
          values: 'US',
          valuesType: RuleConditionValueType.String,
        },
      ],
    });
  });
});
