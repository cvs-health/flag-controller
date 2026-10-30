// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames';
import { type FlagVariationsTableColumns, type FractionalsTableColumns, RuleConditionType } from 'shared-types';

import { ReadOnlyContextRuleCondition } from '../../components/ReadOnlyContextRuleCondition/ReadOnlyContextRuleCondition';
import { ReadOnlyFractionalServe } from '../../components/ReadOnlyFractionalServe/ReadOnlyFractionalServe';
import { ReadOnlySegmentRuleCondition } from '../../components/ReadOnlySegmentRuleCondition/ReadOnlySegmentRuleCondition';
import { ReadOnlyTimeRuleCondition } from '../../components/ReadOnlyTimeRuleCondition/ReadOnlyTimeRuleCondition';
import { ReadOnlyVariationServe } from '../../components/ReadOnlyVariationServe/ReadOnlyVariationServe';
import { RuleConditional, SegmentRuleConditional, type RuleConditionWithId } from '../../typings/rules';

interface RuleSummary {
  conditions: RuleConditionWithId[];
  segments: Map<string, string>;
  serveFractional: Pick<FractionalsTableColumns, 'var' | 'weights'> | null;
  serveVariationId: string | null;
  variations: FlagVariationsTableColumns[];
}

export function RuleSummary({ conditions, segments, variations, serveVariationId, serveFractional }: RuleSummary) {
  return (
    <div>
      <span className={classNames('cds--label')}>Summary</span>
      {conditions.map((condition, index) => {
        const standardConditional = index ? RuleConditional.And : RuleConditional.If;

        if (condition.type === RuleConditionType.Context) {
          return (
            <ReadOnlyContextRuleCondition
              attribute={condition.attribute}
              conditional={standardConditional}
              context={condition.context}
              key={condition.id}
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
              segmentKey={segments.get(condition.segmentId) || ''}
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
      {serveVariationId ? <ReadOnlyVariationServe variationId={serveVariationId} variations={variations} /> : null}
      {serveFractional ? <ReadOnlyFractionalServe fractional={serveFractional} variations={variations} /> : null}
    </div>
  );
}
