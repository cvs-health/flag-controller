// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { Operator } from 'shared-types';

import styles from './ReadOnlySegmentRuleCondition.module.scss';
import type { SegmentRuleConditional } from '../../typings/rules';
import { segmentOperatorTranslation, segmentRuleConditionalTranslation } from '../../constants/common';

interface ReadOnlySegmentRuleConditionProps {
  className?: string;
  conditional: SegmentRuleConditional;
  operator: Operator;
  segmentKey: string;
}

export function ReadOnlySegmentRuleCondition({
  className = '',
  conditional,
  operator,
  segmentKey,
}: ReadOnlySegmentRuleConditionProps) {
  return (
    <div className={className}>
      <span className={styles.conditional}>{segmentRuleConditionalTranslation[conditional]}</span>
      <span className={styles.operator}>
        {segmentOperatorTranslation[operator as keyof typeof segmentOperatorTranslation]}
      </span>
      {segmentKey}
    </div>
  );
}
