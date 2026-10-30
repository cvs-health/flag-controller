// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { RuleConditionType, type Operator, type TimeRuleCondition, type TimeZone } from 'shared-types';

import styles from './ReadOnlyTimeRuleCondition.module.scss';
import type { RuleConditional } from '../../typings/rules';
import { ruleConditionalTranslation } from '../../constants/common';
import ruleConditionAsNaturalLanguage from '../../utils/ruleConditionAsNaturalLanguage';

interface ReadOnlyTimeRuleConditionProps {
  className?: string;
  conditional: RuleConditional;
  endDate?: string | null;
  endDateTimeZone?: TimeZone | null;
  operator?: Operator;
  startDate: string;
  startDateTimeZone: TimeZone;
}

export function ReadOnlyTimeRuleCondition({
  className = '',
  conditional,
  endDate,
  endDateTimeZone,
  operator,
  startDate,
  startDateTimeZone,
}: ReadOnlyTimeRuleConditionProps) {
  return (
    <div className={className}>
      <span className={styles.conditional}>{ruleConditionalTranslation[conditional]}</span>
      <span>
        {ruleConditionAsNaturalLanguage({
          endDate,
          endDateTimeZone,
          operator,
          startDate,
          startDateTimeZone,
          type: RuleConditionType.Time,
        } as TimeRuleCondition)}
      </span>
    </div>
  );
}
