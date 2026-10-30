// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  Clause,
  type ContextRuleCondition,
  Operator,
  type ResolvedSegmentRuleCondition,
  RuleConditionType,
  type TimeRuleCondition,
} from 'shared-types';
import { FLAGD_TIMESTAMP } from 'shared-constants';
import { fromZonedTime } from 'date-fns-tz';

import genericCondition from './genericCondition.js';
import propertyReference from './propertyReference.js';
import semVerCondition from './semVerCondition.js';
import { isResolvedSegmentRuleCondition } from './typeGuards.js';

function target(
  applicationName: string,
  environmentKey: string,
  condition: ContextRuleCondition | TimeRuleCondition | ResolvedSegmentRuleCondition,
  time: string | number = FLAGD_TIMESTAMP,
) {
  const segmentCondition = isResolvedSegmentRuleCondition(condition);

  if (segmentCondition) {
    if (condition.operator === Operator.Not) {
      return {
        [Operator.Not]: {
          $ref: propertyReference(applicationName, environmentKey, condition.segmentKey),
        },
      };
    }
    return {
      $ref: propertyReference(applicationName, environmentKey, condition.segmentKey),
    };
  }

  if (condition.clause === Clause.SemVer) {
    return semVerCondition(condition as ContextRuleCondition);
  }

  if (condition.type === RuleConditionType.Time) {
    const timeArgument = time === FLAGD_TIMESTAMP ? { var: time } : time;
    const date = fromZonedTime(condition.startDate, condition.startDateTimeZone);
    const epochSeconds = Math.floor(date.getTime() / 1000);

    if (condition.operator === Operator.LessThanOrEqual && condition.endDate && condition.endDateTimeZone) {
      const endDate = fromZonedTime(condition.endDate, condition.endDateTimeZone);
      const endEpochSeconds = Math.floor(endDate.getTime() / 1000);
      // handle between
      return {
        [condition.operator]: [epochSeconds, timeArgument, endEpochSeconds],
      };
    }

    if (condition.operator === Operator.GreaterThan) {
      return {
        [condition.operator]: [timeArgument, epochSeconds],
      };
    }

    return {
      [condition.operator]: [epochSeconds, timeArgument],
    };
  }

  return genericCondition(condition as ContextRuleCondition);
}

export default target;
