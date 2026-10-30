// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Clause, type ContextRuleCondition, Operator, RuleConditionType, RuleConditionValueType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import segmentToFlagdEvaluator from '../segmentToFlagdEvaluator.js';

describe('segmentToFlagdEvaluator', () => {
  it('should create an evaluator for a single condition', () => {
    const segmentRule = {
      conditions: [
        {
          context: 'user',
          attribute: 'locale',
          operator: Operator.In,
          values: 'cool',
          valuesType: RuleConditionValueType.String,
          clause: Clause.If,
          type: RuleConditionType.Context,
        } as ContextRuleCondition,
      ],
      createdAt: '2024-06-07 12:23:33.868165-04',
      environmentKey: 'development',
      flagId: null,
      id: 3,
      key: 'rule-key-3',
      updatedAt: '2024-06-07 12:23:33.868165-04',
      orderPosition: 1,
      segmentId: 1,
      serve: null,
      serveType: null,
    };
    const result = segmentToFlagdEvaluator('segmentKey', segmentRule.conditions, 'applicationName', 'environmentKey');

    expect(result).toEqual({
      'applicationName/environmentKey/segmentKey': {
        in: [
          'cool',
          {
            var: 'user.locale',
          },
        ],
      },
    });
  });

  it('should create an evaluator for multiple conditions', () => {
    const segmentRule = {
      conditions: [
        {
          context: 'user',
          attribute: 'locale',
          operator: Operator.In,
          values: 'cool',
          clause: Clause.If,
          type: RuleConditionType.Context,
        } as ContextRuleCondition,
        {
          context: 'user',
          attribute: 'locale',
          operator: Operator.In,
          values: 'awesome',
          clause: Clause.If,
          type: RuleConditionType.Context,
        } as ContextRuleCondition,
      ],
      createdAt: '2024-06-07 12:23:33.868165-04',
      environmentKey: 'development',
      flagId: null,
      id: 3,
      key: 'rule-key-3',
      updatedAt: '2024-06-07 12:23:33.868165-04',
      orderPosition: 1,
      segmentId: 1,
      serve: null,
      serveType: null,
    };
    const result = segmentToFlagdEvaluator('segmentKey', segmentRule.conditions, 'applicationName', 'environmentKey');

    expect(result).toEqual({
      'applicationName/environmentKey/segmentKey': {
        and: [
          {
            in: [
              'cool',
              {
                var: 'user.locale',
              },
            ],
          },
          {
            in: [
              'awesome',
              {
                var: 'user.locale',
              },
            ],
          },
        ],
      },
    });
  });
});
