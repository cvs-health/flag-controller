// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Clause, Operator, RuleConditionType, RuleConditionValueType, TimeZone } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { getRuleConditionFromFormData, getRuleConditionsFromFormData } from '../getRuleConditionsFromFormData';

describe('getRuleConditionFromFormData', () => {
  it('parses a context condition', () => {
    const formData = new FormData();

    formData.append('condition-id-attribute', 'country');
    formData.append('condition-id-context', 'user');
    formData.append('condition-id-values', 'US');
    formData.append('condition-id-valuesType', RuleConditionValueType.String);
    formData.append('condition-id-clause', Clause.If);
    formData.append('condition-id-conditionType', RuleConditionType.Context);
    formData.append('condition-id-operator', Operator.In);

    expect(getRuleConditionFromFormData(formData, 'condition-id')).toEqual({
      attribute: 'country',
      clause: Clause.If,
      context: 'user',
      operator: Operator.In,
      type: RuleConditionType.Context,
      values: 'US',
      valuesType: RuleConditionValueType.String,
    });
  });

  it.each([
    {
      operator: Operator.InList,
      values: 'US\nCA\n',
      valuesType: RuleConditionValueType.String,
      expectedValues: ['US', 'CA'],
    },
    {
      operator: Operator.NotInList,
      values: '18\n21\n',
      valuesType: RuleConditionValueType.Number,
      expectedValues: [18, 21],
    },
    {
      operator: Operator.InList,
      values: 'true\nfalse\n  \n',
      valuesType: RuleConditionValueType.Boolean,
      expectedValues: [true, false],
    },
  ])('parses $operator values as a typed list', ({ operator, values, valuesType, expectedValues }) => {
    const formData = new FormData();

    formData.append('condition-id-attribute', 'value');
    formData.append('condition-id-context', 'user');
    formData.append('condition-id-values', values);
    formData.append('condition-id-valuesType', valuesType);
    formData.append('condition-id-clause', Clause.If);
    formData.append('condition-id-conditionType', RuleConditionType.Context);
    formData.append('condition-id-operator', operator);

    expect(getRuleConditionFromFormData(formData, 'condition-id')).toEqual({
      attribute: 'value',
      clause: Clause.If,
      context: 'user',
      operator,
      type: RuleConditionType.Context,
      values: expectedValues,
      valuesType,
    });
  });

  it('parses a segment condition', () => {
    const formData = new FormData();

    formData.append('condition-id-segmentId', 'segment-id');
    formData.append('condition-id-clause', Clause.If);
    formData.append('condition-id-conditionType', RuleConditionType.Segment);
    formData.append('condition-id-operator', Operator.In);

    expect(getRuleConditionFromFormData(formData, 'condition-id')).toEqual({
      clause: Clause.If,
      operator: Operator.In,
      segmentId: 'segment-id',
      type: RuleConditionType.Segment,
    });
  });

  it('parses a time condition and converts dates to UTC', () => {
    const formData = new FormData();

    formData.append('condition-id-startDate', '01/01/2024');
    formData.append('condition-id-startDate-time', '12:00');
    formData.append('condition-id-startDate-meridiem', 'PM');
    formData.append('condition-id-startDate-timeZone', TimeZone.NewYork);
    formData.append('condition-id-endDate', '12/31/2024');
    formData.append('condition-id-endDate-time', '12:00');
    formData.append('condition-id-endDate-meridiem', 'PM');
    formData.append('condition-id-endDate-timeZone', TimeZone.NewYork);
    formData.append('condition-id-clause', Clause.If);
    formData.append('condition-id-conditionType', RuleConditionType.Time);
    formData.append('condition-id-operator', Operator.GreaterThan);

    expect(getRuleConditionFromFormData(formData, 'condition-id')).toEqual({
      clause: Clause.If,
      endDate: '2024-12-31T17:00:00.000Z',
      endDateTimeZone: TimeZone.NewYork,
      operator: Operator.GreaterThan,
      startDate: '2024-01-01T17:00:00.000Z',
      startDateTimeZone: TimeZone.NewYork,
      type: RuleConditionType.Time,
    });
  });

  it('returns empty dates when the time condition contains an invalid date', () => {
    const formData = new FormData();

    formData.append('condition-id-startDate', '02/30/2024');
    formData.append('condition-id-startDate-time', '12:00');
    formData.append('condition-id-startDate-meridiem', 'PM');
    formData.append('condition-id-startDate-timeZone', TimeZone.NewYork);
    formData.append('condition-id-clause', Clause.If);
    formData.append('condition-id-conditionType', RuleConditionType.Time);
    formData.append('condition-id-operator', Operator.GreaterThan);

    expect(getRuleConditionFromFormData(formData, 'condition-id')).toEqual({
      clause: Clause.If,
      endDate: '',
      endDateTimeZone: null,
      operator: Operator.GreaterThan,
      startDate: '',
      startDateTimeZone: TimeZone.NewYork,
      type: RuleConditionType.Time,
    });
  });
});

describe('getRuleConditionsFromFormData', () => {
  it('adds condition IDs while parsing multiple conditions', () => {
    const formData = new FormData();

    formData.append('context-id-attribute', 'country');
    formData.append('context-id-context', 'user');
    formData.append('context-id-values', 'US');
    formData.append('context-id-valuesType', RuleConditionValueType.String);
    formData.append('context-id-clause', Clause.If);
    formData.append('context-id-conditionType', RuleConditionType.Context);
    formData.append('context-id-operator', Operator.In);
    formData.append('segment-id-segmentId', 'segment-id');
    formData.append('segment-id-clause', Clause.And);
    formData.append('segment-id-conditionType', RuleConditionType.Segment);
    formData.append('segment-id-operator', Operator.NotIn);

    expect(getRuleConditionsFromFormData(formData, ['context-id', 'segment-id'])).toEqual([
      {
        attribute: 'country',
        clause: Clause.If,
        context: 'user',
        id: 'context-id',
        operator: Operator.In,
        type: RuleConditionType.Context,
        values: 'US',
        valuesType: RuleConditionValueType.String,
      },
      {
        clause: Clause.And,
        id: 'segment-id',
        operator: Operator.NotIn,
        segmentId: 'segment-id',
        type: RuleConditionType.Segment,
      },
    ]);
  });
});
