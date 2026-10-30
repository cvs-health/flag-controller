// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  Clause,
  FeatureFlagType,
  Operator,
  RuleServeType,
  RuleConditionValueType,
  RuleConditionType,
  type ContextRuleCondition,
} from 'shared-types';
import { describe, expect, it } from 'vitest';

import compareRules from '../compareRules';

describe('compareRules', () => {
  const mockRule = {
    applicationId: 'app-id',
    archived: false,
    createdAt: '2023-01-01T00:00:00Z',
    deletedAt: null,
    description: 'A test rule',
    id: '1',
    key: 'test-rule',
    orderPosition: 1,
    type: FeatureFlagType.Boolean,
    updatedAt: '2023-01-01T00:00:00Z',
    serveType: RuleServeType.Variation,
    serveFractional: null,
    serveVariationKey: 'variation-1',
    environmentId: 'environment-id',
    flagId: 'flag-id',
    segmentId: 'segment-id',
    serveFractionalId: null,
    serveVariationId: 'variation-id',
    conditions: [
      {
        context: 'user',
        attribute: 'id',
        operator: Operator.In,
        values: '123, 456',
        clause: Clause.If,
        valuesType: RuleConditionValueType.String,
        type: RuleConditionType.Context,
      } as ContextRuleCondition,
    ],
  };

  it('should return empty array for identical rules', () => {
    const result = compareRules(mockRule, mockRule);

    expect(result).toEqual([]);
  });

  it('should detect differences in general property', () => {
    const rule1 = { ...mockRule, key: 'old-key' };
    const rule2 = { ...mockRule, key: 'new-key' };

    const result = compareRules(rule1, rule2);

    expect(result).toEqual([
      {
        property: 'key',
        oldValue: 'old-key',
        newValue: 'new-key',
      },
    ]);
  });

  it('should detect differences in serve property from string to string', () => {
    const rule1 = { ...mockRule, serve: 'variation1' };
    const rule2 = { ...mockRule, serve: 'variation2' };

    const result = compareRules(rule1, rule2);

    expect(result).toEqual([
      {
        property: 'serve',
        oldValue: 'variation1',
        newValue: 'variation2',
      },
    ]);
  });

  it('should detect differences in conditions property', () => {
    const rule1 = {
      ...mockRule,
      conditions: [
        {
          attribute: 'id',
          clause: Clause.If,
          context: 'user',
          operator: Operator.In,
          type: RuleConditionType.Context,
          values: '["123"]',
          valuesType: RuleConditionValueType.String,
        } as ContextRuleCondition,
      ],
    };
    const rule2 = {
      ...mockRule,
      conditions: [
        {
          attribute: 'id',
          clause: Clause.If,
          context: 'user',
          operator: Operator.In,
          type: RuleConditionType.Context,
          values: '["456"]',
          valuesType: RuleConditionValueType.String,
        } as ContextRuleCondition,
      ],
    };

    const result = compareRules(rule1, rule2);

    expect(result).toEqual([
      {
        property: 'conditions',
        oldValue: 'context user.id contains ["123"]',
        newValue: 'context user.id contains ["456"]',
      },
    ]);
  });

  it('should handle multiple conditions', () => {
    const rule1 = {
      ...mockRule,
      conditions: [
        {
          attribute: 'id',
          clause: Clause.If,
          context: 'user',
          operator: Operator.In,
          type: RuleConditionType.Context,
          values: '["123"]',
          valuesType: RuleConditionValueType.String,
        } as ContextRuleCondition,
        {
          attribute: 'headers',
          clause: Clause.And,
          context: 'request',
          operator: Operator.StartsWith,
          type: RuleConditionType.Context,
          values: 'Bearer',
          valuesType: RuleConditionValueType.String,
        } as ContextRuleCondition,
      ],
    };
    const rule2 = {
      ...mockRule,
      conditions: [
        {
          attribute: 'id',
          clause: Clause.If,
          context: 'user',
          operator: Operator.In,
          type: RuleConditionType.Context,
          values: '["456"]',
          valuesType: RuleConditionValueType.String,
        } as ContextRuleCondition,
        {
          attribute: 'headers',
          clause: Clause.And,
          context: 'request',
          operator: Operator.StartsWith,
          type: RuleConditionType.Context,
          values: 'Bearer',
          valuesType: RuleConditionValueType.String,
        } as ContextRuleCondition,
      ],
    };

    const result = compareRules(rule1, rule2);

    expect(result).toEqual([
      {
        property: 'conditions',
        oldValue: 'context user.id contains ["123"] AND context request.headers starts with Bearer',
        newValue: 'context user.id contains ["456"] AND context request.headers starts with Bearer',
      },
    ]);
  });

  it('should handle serve type changes', () => {
    const rule1 = { ...mockRule, serveType: RuleServeType.Variation };
    const rule2 = { ...mockRule, serveType: RuleServeType.Fractional };

    const result = compareRules(rule1, rule2);

    expect(result).toEqual([
      {
        property: 'serveType',
        oldValue: RuleServeType.Variation,
        newValue: RuleServeType.Fractional,
      },
    ]);
  });
});
