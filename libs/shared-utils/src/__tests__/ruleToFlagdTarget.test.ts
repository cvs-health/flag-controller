// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  Clause,
  Operator,
  type FractionalWeight,
  RuleServeType,
  RuleConditionType,
  RuleConditionValueType,
  ContextRuleCondition,
  FractionalType,
  TimeRuleCondition,
  TimeZone,
} from 'shared-types';
import { describe, expect, it } from 'vitest';
import { EnvironmentKey } from 'shared-types';

import ruleToFlagdTarget from '../ruleToFlagdTarget.js';

describe('ruleToFlagdTarget', () => {
  const baseCondition = {
    context: 'user',
    attribute: 'language',
    operator: Operator.LooseEquals,
    values: 'en',
    clause: Clause.If,
    type: RuleConditionType.Context,
    valuesType: RuleConditionValueType.String,
  } as ContextRuleCondition;

  it(`should create a targeting object for ${RuleServeType.Variation} rule`, () => {
    const conditions = [baseCondition];
    const serve = 'some-variation-key';
    const result = ruleToFlagdTarget(
      conditions,
      serve,
      RuleServeType.Variation,
      'applicationName',
      EnvironmentKey.Development,
    );

    expect(result).toEqual([{ [Operator.LooseEquals]: [{ var: 'user.language' }, 'en'] }, serve]);
  });

  it('should return only the serving value when a rule has no conditions', () => {
    const serve = 'some-variation-key';

    expect(
      ruleToFlagdTarget([], serve, RuleServeType.Variation, 'applicationName', EnvironmentKey.Development),
    ).toEqual([serve]);
  });

  it(`should create a targeting object for ${RuleServeType.Fractional} rule`, () => {
    const conditions = [
      baseCondition,
      {
        ...baseCondition,
        values: 'es',
      },
    ];
    const serve = {
      weights: [
        ['red', 25],
        ['blue', 25],
        ['green', 25],
        ['grey', 25],
      ] as FractionalWeight[],
      var: 'user.country',
      type: FractionalType.Contextual,
    };
    const result = ruleToFlagdTarget(
      conditions,
      serve,
      RuleServeType.Fractional,
      'applicationName',
      EnvironmentKey.Development,
    );

    expect(result).toEqual([
      {
        and: [
          { [Operator.LooseEquals]: [{ var: 'user.language' }, 'en'] },
          { [Operator.LooseEquals]: [{ var: 'user.language' }, 'es'] },
        ],
      },
      {
        fractional: [
          {
            cat: [{ var: '$flagd.flagKey' }, { var: 'user.country' }],
          },
          ['red', 25],
          ['blue', 25],
          ['green', 25],
          ['grey', 25],
        ],
      },
    ]);
  });

  it('should pass the evaluation time to time conditions', () => {
    const condition: TimeRuleCondition = {
      clause: Clause.If,
      endDate: null,
      endDateTimeZone: null,
      operator: Operator.GreaterThan,
      startDate: '2024-01-01T12:00:00',
      startDateTimeZone: TimeZone.NewYork,
      type: RuleConditionType.Time,
    };
    const time = 1704132000;

    expect(
      ruleToFlagdTarget(
        [condition],
        'some-variation-key',
        RuleServeType.Variation,
        'applicationName',
        EnvironmentKey.Development,
        time,
      ),
    ).toEqual([{ [Operator.GreaterThan]: [time, 1704128400] }, 'some-variation-key']);
  });
});
