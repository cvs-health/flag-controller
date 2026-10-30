// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ContextRuleCondition, ResolvedSegmentRuleCondition, TimeRuleCondition } from 'shared-types';
import { isContextRuleCondition, isResolvedSegmentRuleCondition, isTimeRuleCondition } from 'shared-utils';
import { formatInTimeZone } from 'date-fns-tz';
import { TIMEZONE_FRIENDLY_NAMES } from 'shared-constants';

import { operatorTranslation, segmentOperatorTranslation, timeOperatorTranslation } from '../constants/common';

function ruleConditionAsNaturalLanguage(
  condition: ContextRuleCondition | ResolvedSegmentRuleCondition | TimeRuleCondition,
) {
  if (isResolvedSegmentRuleCondition(condition)) {
    return `context ${segmentOperatorTranslation[condition.operator as keyof typeof segmentOperatorTranslation]} segment '${condition.segmentKey}'`;
  }

  if (isTimeRuleCondition(condition)) {
    return `time ${timeOperatorTranslation[condition.operator as keyof typeof timeOperatorTranslation]} ${condition.startDate ? formatInTimeZone(condition.startDate, condition.startDateTimeZone, 'MM/dd/yyyy hh:mm aa') : '-'} ${TIMEZONE_FRIENDLY_NAMES[condition.startDateTimeZone]} ${
      condition.endDate && condition.endDateTimeZone
        ? `and ${condition.endDate ? formatInTimeZone(condition.endDate, condition.endDateTimeZone, 'MM/dd/yyyy hh:mm aa') : '-'} ${TIMEZONE_FRIENDLY_NAMES[condition.endDateTimeZone]}`
        : ''
    }`;
  }

  if (isContextRuleCondition(condition)) {
    const hasValue = condition.values !== null && condition.values !== undefined;
    const value = Array.isArray(condition.values) ? `${condition.values.length} values` : condition.values;

    return hasValue || condition.context
      ? `context ${condition.context || '-'}${condition.attribute ? `.${condition.attribute}` : ''} ${operatorTranslation[condition.operator as keyof typeof operatorTranslation]} ${value ?? '-'}`
      : '(no conditions defined)';
  }

  return 'unknown condition';
}

export default ruleConditionAsNaturalLanguage;
