// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  Clause,
  Operator,
  RuleConditionType,
  RuleConditionValueType,
  TimeZone,
  type ContextRuleCondition,
  type TimeRuleCondition,
} from 'shared-types';
import { FLAGD_TIMESTAMP } from 'shared-constants';
import { describe, expect, it } from 'vitest';

import target from '../target.js';

describe('target', () => {
  it('should provide a targeting target for a segment condition', () => {
    const condition = {
      clause: Clause.If,
      operator: Operator.LooseEquals,
      segmentKey: 'key',
    };

    expect(target('applicationName', 'environmentKey', condition)).toEqual({
      $ref: 'applicationName/environmentKey/key',
    });
  });

  it('should provide a targeting target for a negated segment condition', () => {
    const condition = {
      clause: Clause.If,
      operator: Operator.Not,
      segmentKey: 'key',
    };

    expect(target('applicationName', 'environmentKey', condition)).toEqual({
      '!': {
        $ref: 'applicationName/environmentKey/key',
      },
    });
  });

  it('should check whether a context value is in a list', () => {
    const condition: ContextRuleCondition = {
      attribute: 'country',
      clause: Clause.If,
      context: 'user',
      operator: Operator.InList,
      type: RuleConditionType.Context,
      values: ['us', 'ca'],
      valuesType: RuleConditionValueType.String,
    };

    expect(target('applicationName', 'environmentKey', condition)).toEqual({
      in: [{ var: 'user.country' }, ['us', 'ca']],
    });
  });

  it('should provide a targeting target for a semver condition', () => {
    const condition = {
      clause: Clause.SemVer,
      context: 'version',
      operator: Operator.GreaterThan,
      type: RuleConditionType.Context,
      values: '1.0.0',
      valuesType: RuleConditionValueType.String,
    } as ContextRuleCondition;

    expect(target('applicationName', 'environmentKey', condition)).toEqual({
      sem_ver: [
        {
          var: 'version',
        },
        Operator.GreaterThan,
        condition.values,
      ],
    });
  });

  it('should provide a targeting target for a time condition using the flagd timestamp', () => {
    const condition: TimeRuleCondition = {
      clause: Clause.If,
      endDate: null,
      endDateTimeZone: null,
      operator: Operator.GreaterThanOrEqual,
      startDate: '2024-01-01T12:00:00',
      startDateTimeZone: TimeZone.NewYork,
      type: RuleConditionType.Time,
    };

    expect(target('applicationName', 'environmentKey', condition)).toEqual({
      [Operator.GreaterThanOrEqual]: [1704128400, { var: FLAGD_TIMESTAMP }],
    });
  });

  it('should provide a targeting target for a time condition with an explicit time', () => {
    const condition: TimeRuleCondition = {
      clause: Clause.If,
      endDate: null,
      endDateTimeZone: null,
      operator: Operator.LessThan,
      startDate: '2024-01-01T12:00:00',
      startDateTimeZone: TimeZone.NewYork,
      type: RuleConditionType.Time,
    };

    expect(target('applicationName', 'environmentKey', condition, 1704132000)).toEqual({
      [Operator.LessThan]: [1704128400, 1704132000],
    });
  });

  it('should provide a targeting target for a time condition between two dates', () => {
    const condition: TimeRuleCondition = {
      clause: Clause.If,
      endDate: '2024-01-01T13:00:00',
      endDateTimeZone: TimeZone.NewYork,
      operator: Operator.LessThanOrEqual,
      startDate: '2024-01-01T12:00:00',
      startDateTimeZone: TimeZone.NewYork,
      type: RuleConditionType.Time,
    };

    expect(target('applicationName', 'environmentKey', condition, 1704132000)).toEqual({
      [Operator.LessThanOrEqual]: [1704128400, 1704132000, 1704132000],
    });
  });

  it('should reverse the operands for a greater-than time condition', () => {
    const condition: TimeRuleCondition = {
      clause: Clause.If,
      endDate: null,
      endDateTimeZone: null,
      operator: Operator.GreaterThan,
      startDate: '2024-01-01T12:00:00',
      startDateTimeZone: TimeZone.NewYork,
      type: RuleConditionType.Time,
    };

    expect(target('applicationName', 'environmentKey', condition, 1704132000)).toEqual({
      [Operator.GreaterThan]: [1704132000, 1704128400],
    });
  });
});
