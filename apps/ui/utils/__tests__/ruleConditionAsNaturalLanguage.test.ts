// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  Clause,
  type ContextRuleCondition,
  type TimeRuleCondition,
  Operator,
  RuleConditionType,
  RuleConditionValueType,
  TimeZone,
} from 'shared-types';
import { describe, expect, it } from 'vitest';

import ruleConditionAsNaturalLanguage from '../ruleConditionAsNaturalLanguage';

describe('ruleConditionAsNaturalLanguage', () => {
  it('should convert generic rule condition to natural language', () => {
    const condition = {
      attribute: 'id',
      clause: Clause.If,
      context: 'user',
      operator: Operator.In,
      type: RuleConditionType.Context,
      values: '123, 456',
      valuesType: RuleConditionValueType.String,
    } as ContextRuleCondition;

    const result = ruleConditionAsNaturalLanguage(condition);

    expect(result).toEqual('context user.id contains 123, 456');
  });

  it('should convert segment rule condition to natural language', () => {
    const condition = {
      clause: Clause.If,
      operator: Operator.LooseEquals,
      segmentKey: 'premium-users',
      type: RuleConditionType.Segment,
    };

    const result = ruleConditionAsNaturalLanguage(condition);

    expect(result).toEqual("context is in segment 'premium-users'");
  });

  it('should handle segment condition with not operator', () => {
    const condition = {
      clause: Clause.If,
      operator: Operator.Not,
      segmentKey: 'beta-users',
      type: RuleConditionType.Segment,
    };

    const result = ruleConditionAsNaturalLanguage(condition);

    expect(result).toEqual("context is not in segment 'beta-users'");
  });

  it('should handle condition without attribute', () => {
    const condition = {
      clause: Clause.If,
      context: 'user',
      operator: Operator.LooseEquals,
      type: RuleConditionType.Context,
      values: 'true',
      valuesType: RuleConditionValueType.Boolean,
    } as ContextRuleCondition;

    const result = ruleConditionAsNaturalLanguage(condition);

    expect(result).toEqual('context user equals true');
  });

  it('should handle time condition', () => {
    const condition = {
      clause: Clause.If,
      endDate: '2024-01-01T00:00:00Z',
      endDateTimeZone: TimeZone.NewYork,
      operator: Operator.LessThanOrEqual,
      startDate: '2024-01-01T00:00:00Z',
      startDateTimeZone: TimeZone.NewYork,
      type: RuleConditionType.Time,
    } as TimeRuleCondition;

    const result = ruleConditionAsNaturalLanguage(condition);

    expect(result).toEqual('time is between 12/31/2023 07:00 PM EST and 12/31/2023 07:00 PM EST');
  });

  it('should format time conditions in the condition timezone', () => {
    const condition = {
      clause: Clause.If,
      operator: Operator.GreaterThan,
      startDate: '2024-01-01T00:00:00Z',
      startDateTimeZone: TimeZone.LosAngeles,
      type: RuleConditionType.Time,
    } as TimeRuleCondition;

    const result = ruleConditionAsNaturalLanguage(condition);

    expect(result).toEqual('time is after 12/31/2023 04:00 PM PST ');
  });
});
