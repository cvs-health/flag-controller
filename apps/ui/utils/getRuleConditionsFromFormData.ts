// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  type Clause,
  type ContextRuleCondition,
  Operator,
  type RuleCondition,
  RuleConditionType,
  type RuleConditionValueType,
  type SegmentRuleCondition,
  type TimeRuleCondition,
  type TimeZone,
} from 'shared-types';
import { castValuesByType } from 'shared-utils';
import { isValid, parse } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

import type { RuleConditionWithId } from '../typings/rules';

export function getRuleConditionsFromFormData(formData: FormData, ruleConditionIds: string[]): RuleConditionWithId[] {
  return ruleConditionIds.map((conditionId) => ({
    ...getRuleConditionFromFormData(formData, conditionId),
    id: conditionId,
  }));
}

export function getRuleConditionFromFormData(formData: FormData, conditionId: string): RuleCondition {
  const conditionType = formData.get(`${conditionId}-conditionType`) as RuleConditionType;
  const clause = formData.get(`${conditionId}-clause`) as Clause;
  const operator = formData.get(`${conditionId}-operator`) as Operator;

  if (conditionType === RuleConditionType.Segment) {
    return {
      segmentId: formData.get(`${conditionId}-segmentId`) as string,
      operator,
      clause,
      type: RuleConditionType.Segment,
    } satisfies SegmentRuleCondition;
  }

  if (conditionType === RuleConditionType.Time) {
    const startDate = formData.get(`${conditionId}-startDate`) as string;
    const startDateTime = formData.get(`${conditionId}-startDate-time`) as string;
    const startDateMeridiem = formData.get(`${conditionId}-startDate-meridiem`) as string;
    const endDateMeridiem = formData.get(`${conditionId}-endDate-meridiem`) as string;
    const endDateTime = formData.get(`${conditionId}-endDate-time`) as string;
    const endDate = formData.get(`${conditionId}-endDate`) as string;
    const startDateTimeZone = formData.get(`${conditionId}-startDate-timeZone`) as TimeZone;
    const endDateTimeZone = formData.get(`${conditionId}-endDate-timeZone`) as TimeZone;
    const startDateParsed = parse(
      `${startDate} ${startDateTime} ${startDateMeridiem}`,
      'MM/dd/yyyy h:mm aa',
      new Date(),
    );

    const startUtcIso = isValid(startDateParsed) ? fromZonedTime(startDateParsed, startDateTimeZone).toISOString() : '';
    let endUtcIso = startUtcIso;

    if (endDate && endDateTime && endDateMeridiem) {
      const endDateParsed = parse(`${endDate} ${endDateTime} ${endDateMeridiem}`, 'MM/dd/yyyy h:mm aa', new Date());

      endUtcIso = isValid(endDateParsed) ? fromZonedTime(endDateParsed, endDateTimeZone).toISOString() : '';
    }

    return {
      clause,
      operator,
      startDate: startUtcIso,
      endDate: endUtcIso,
      startDateTimeZone,
      endDateTimeZone,
      type: RuleConditionType.Time,
    } satisfies TimeRuleCondition;
  }

  const values = formData.get(`${conditionId}-values`) as string;
  const valuesType = formData.get(`${conditionId}-valuesType`) as RuleConditionValueType;
  const isListOperator = [Operator.InList, Operator.NotInList].includes(operator);
  const parsedValues = isListOperator ? values.split(/\r\n|\n|\r/).filter((value) => value.trim() !== '') : values;
  const castedValues = castValuesByType(parsedValues, valuesType);

  return {
    attribute: formData.get(`${conditionId}-attribute`) as string,
    clause,
    context: formData.get(`${conditionId}-context`) as string,
    operator,
    values: castedValues,
    valuesType,
    type: RuleConditionType.Context,
  } satisfies ContextRuleCondition;
}
