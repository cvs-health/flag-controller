// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames';
import { Button, Tile } from '@carbon/react';
import {
  RuleConditionType,
  type SegmentsTableColumns,
  type ContextRuleCondition,
  type FlagVariationsTableColumns,
  type SegmentRuleCondition,
  type TimeRuleCondition,
  type FractionalsTableColumns,
} from 'shared-types';
import { useMemo } from 'react';

import CircleBadge from '../CircleBadge/CircleBadge';
import RuleHeadingTile from '../RuleHeadingTile/RuleHeadingTile';
import mapIdTo from '../../utils/mapIdTo';
import styles from './ReadOnlyFeatureFlagRule.module.scss';
import type { WithId } from '../../typings/common';
import { ReadOnlyContextRuleCondition } from '../ReadOnlyContextRuleCondition/ReadOnlyContextRuleCondition';
import { ReadOnlyFractionalServe } from '../ReadOnlyFractionalServe/ReadOnlyFractionalServe';
import { ReadOnlySegmentRuleCondition } from '../ReadOnlySegmentRuleCondition/ReadOnlySegmentRuleCondition';
import { ReadOnlyTimeRuleCondition } from '../ReadOnlyTimeRuleCondition/ReadOnlyTimeRuleCondition';
import { ReadOnlyVariationServe } from '../ReadOnlyVariationServe/ReadOnlyVariationServe';
import { RuleConditional, SegmentRuleConditional } from '../../typings/rules';

type Condition = WithId<ContextRuleCondition> | WithId<SegmentRuleCondition> | WithId<TimeRuleCondition>;

interface ReadOnlyFeatureFlagRuleProps {
  serveFractional: FractionalsTableColumns | null;
  assignedKey: string;
  className?: string;
  conditions: Condition[];
  id: string;
  markedForRemoval?: boolean;
  onCancelRemoval?: (ruleId: string) => void;
  orderPosition: number;
  segments: SegmentsTableColumns[];
  serveVariationId: string | null;
  variations: FlagVariationsTableColumns[];
}

export function ReadOnlyFeatureFlagRule({
  assignedKey,
  className = '',
  conditions = [],
  id,
  markedForRemoval = false,
  onCancelRemoval,
  orderPosition,
  serveVariationId = null,
  serveFractional = null,
  variations,
  segments = [],
}: ReadOnlyFeatureFlagRuleProps) {
  const segmentsById = useMemo(() => {
    return mapIdTo(segments, 'key');
  }, [segments]);

  function handleCancelRemoval() {
    onCancelRemoval?.(id);
  }

  return (
    <div className={classNames(styles.root, className)}>
      <RuleHeadingTile label="Rule key" heading={assignedKey} markedForRemoval={markedForRemoval} />
      <Tile>
        <div className={styles.content}>
          <div>
            {conditions.map((condition, index) => {
              const standardConditional = index ? RuleConditional.And : RuleConditional.If;

              if (condition.type === RuleConditionType.Context) {
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
              }

              if (condition.type === RuleConditionType.Segment) {
                return (
                  <ReadOnlySegmentRuleCondition
                    conditional={index ? SegmentRuleConditional.AndContext : SegmentRuleConditional.IfContext}
                    key={condition.id}
                    operator={condition.operator}
                    segmentKey={segmentsById.get(condition.segmentId) || ''}
                  />
                );
              }

              return (
                <ReadOnlyTimeRuleCondition
                  startDate={condition.startDate}
                  startDateTimeZone={condition.startDateTimeZone}
                  endDate={condition.endDate}
                  endDateTimeZone={condition.endDateTimeZone}
                  key={condition.id}
                  conditional={standardConditional}
                  operator={condition.operator}
                />
              );
            })}
            {!conditions.length ? <ReadOnlyContextRuleCondition conditional={RuleConditional.If} /> : null}
            {serveVariationId ? (
              <ReadOnlyVariationServe variationId={serveVariationId} variations={variations} />
            ) : null}
            {serveFractional ? <ReadOnlyFractionalServe fractional={serveFractional} variations={variations} /> : null}
          </div>
          {markedForRemoval && (
            <Button kind="ghost" size="sm" className={styles.editButton} onClick={handleCancelRemoval}>
              Cancel removal
            </Button>
          )}
        </div>
        <CircleBadge label={String(orderPosition + 1)} className={styles.orderPosition} />
      </Tile>
    </div>
  );
}
