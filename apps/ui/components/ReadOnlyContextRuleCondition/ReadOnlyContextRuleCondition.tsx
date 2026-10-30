// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { RuleConditionType, type ContextRuleCondition, type Operator, type Values } from 'shared-types';

import styles from './ReadOnlyContextRuleCondition.module.scss';
import type { RuleConditional } from '../../typings/rules';
import { ruleConditionalTranslation } from '../../constants/common';
import ruleConditionAsNaturalLanguage from '../../utils/ruleConditionAsNaturalLanguage';

interface ReadOnlyContextRuleConditionProps {
  attribute?: string;
  className?: string;
  conditional: RuleConditional;
  context?: string;
  operator?: Operator;
  values?: Values;
}

export function ReadOnlyContextRuleCondition({
  attribute = '',
  className = '',
  conditional,
  context,
  operator,
  values,
}: ReadOnlyContextRuleConditionProps) {
  return (
    <div className={className}>
      <span className={styles.conditional}>{ruleConditionalTranslation[conditional]}</span>
      <span>
        {ruleConditionAsNaturalLanguage({
          attribute,
          context,
          operator,
          type: RuleConditionType.Context,
          values,
        } as ContextRuleCondition)}
      </span>
    </div>
  );
}
