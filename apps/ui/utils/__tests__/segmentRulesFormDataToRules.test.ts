// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Clause, Operator, RuleConditionType, RuleConditionValueType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import segmentRulesFormDataToRules from '../segmentRulesFormDataToRules';

describe('segmentRulesFormDataToRules', () => {
  it('should convert form data into a single segment rule with context conditions', () => {
    const formData = new FormData();

    formData.append('environmentId', 'environment-id');
    formData.append('segmentId', 'segment-id');
    formData.append('id', 'rule-id');
    formData.append('key', 'segment-rule');
    formData.append('created', 'true');

    formData.append('operator', Operator.In);
    formData.append('attribute', 'country');
    formData.append('context', 'user');
    formData.append('values', 'US');
    formData.append('valuesType', RuleConditionValueType.String);

    formData.append('operator', Operator.GreaterThan);
    formData.append('attribute', 'version');
    formData.append('context', 'application');
    formData.append('values', '2.0.0');

    const result = segmentRulesFormDataToRules(formData);

    expect(result).toEqual([
      {
        conditions: [
          {
            attribute: 'country',
            clause: Clause.If,
            context: 'user',
            operator: Operator.In,
            type: RuleConditionType.Context,
            values: 'US',
            valuesType: RuleConditionValueType.String,
          },
          {
            attribute: 'version',
            clause: Clause.If,
            context: 'application',
            operator: Operator.GreaterThan,
            type: RuleConditionType.Context,
            values: '2.0.0',
            valuesType: RuleConditionValueType.String,
          },
        ],
        environmentId: 'environment-id',
        id: 'rule-id',
        key: 'segment-rule',
        created: true,
        removed: false,
        orderPosition: 0,
        segmentId: 'segment-id',
      },
    ]);
  });
});
