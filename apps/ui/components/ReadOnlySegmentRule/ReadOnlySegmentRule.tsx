// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { SegmentRule } from 'shared-types';
import classNames from 'classnames';

import styles from './ReadOnlySegmentRule.module.scss';
import { Tile } from '../Carbon';
import { RuleConditional } from '../../typings/rules';
import generateConditionId from '../../utils/generateConditionId';
import RuleHeadingTile from '../RuleHeadingTile/RuleHeadingTile';
import { ReadOnlyContextRuleCondition } from '../ReadOnlyContextRuleCondition/ReadOnlyContextRuleCondition';

interface ReadOnlySegmentRuleProps {
  assignedKey: string;
  className?: string;
  defaultConditions: SegmentRule['conditions'];
  id: string;
}

export function ReadOnlySegmentRule({
  assignedKey,
  defaultConditions = [],
  id,
  className = '',
}: ReadOnlySegmentRuleProps) {
  const conditions = defaultConditions.map((condition, index) => ({
    ...condition,
    id: generateConditionId(id, index),
  }));

  return (
    <div className={classNames(styles.root, className)}>
      <RuleHeadingTile label="Rule key" heading={assignedKey} />
      <Tile>
        <div className={styles.content}>
          {conditions.map((condition, index) => {
            const standardConditional = index ? RuleConditional.And : RuleConditional.If;

            return (
              <ReadOnlyContextRuleCondition
                attribute={condition.attribute}
                conditional={standardConditional}
                context={condition.context}
                key={`${id}-${condition.clause}-${condition.operator}-${condition.values}`}
                operator={condition.operator}
                values={condition.values}
              />
            );
          })}
          {!conditions.length ? <ReadOnlyContextRuleCondition conditional={RuleConditional.If} /> : null}
        </div>
      </Tile>
    </div>
  );
}
