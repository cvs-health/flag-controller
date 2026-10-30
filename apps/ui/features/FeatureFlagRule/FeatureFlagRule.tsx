// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import classNames from 'classnames';
import {
  Button,
  ExpandableTile,
  Layer,
  MenuButton,
  MenuItem,
  Stack,
  TileAboveTheFoldContent,
  TileBelowTheFoldContent,
} from '../../components/Carbon';
import {
  type FlagVariationsTableColumns,
  type FractionalsTableColumns,
  Operator,
  RuleConditionValueType,
  RuleServeType,
  type SegmentsTableColumns,
  RuleConditionType,
  Clause,
} from 'shared-types';
import { type ChangeEvent, type FocusEvent, useMemo, useState } from 'react';

import CircleBadge from '../../components/CircleBadge/CircleBadge';
import Divider from '../../components/Divider/Divider';
import RuleHeadingTile from '../../components/RuleHeadingTile/RuleHeadingTile';
import generateConditionId from '../../utils/generateConditionId';
import getCurrentTimeZone from '../../utils/getCurrentTimeZone';
import mapIdTo from '../../utils/mapIdTo';
import styles from './FeatureFlagRule.module.scss';
import type { RuleConditionWithId } from '../../typings/rules';
import { ContextRuleCondition } from '../../components/ContextRuleCondition/ContextRuleCondition';
import { RuleConditional, SegmentRuleConditional } from '../../typings/rules';
import { RuleKeyInput } from '../../components/RuleKeyInput/RuleKeyInput';
import { RuleServeSelect } from '../../components/RuleServeSelect/RuleServeSelect';
import { RuleSummary } from '../../components/RuleSummary/RuleSummary';
import { SegmentRuleCondition } from '../../components/SegmentRuleCondition/SegmentRuleCondition';
import { TimeRuleCondition } from '../../components/TimeRuleCondition/TimeRuleCondition';
import { WEIGHTED_ROLLOUT_ID } from '../../constants/rules';
import { WeightRollout } from '../WeightRollout/WeightRollout';
import { parseFeatureFlagRule } from '../../utils/parseFeatureFlagRule';

interface FeatureFlagRuleProps {
  assignedKey: string;
  className?: string;
  defaultConditions: RuleConditionWithId[];
  id: string;
  newRule?: boolean;
  onRemoveRule: (ruleId: string) => void;
  orderPosition: number;
  segments: SegmentsTableColumns[];
  serveFractional: FractionalsTableColumns | null;
  serveVariationId: string | null;
  variations: FlagVariationsTableColumns[];
}
interface Summary {
  conditions: RuleConditionWithId[];
  serveVariationId: string | null;
  serveFractional: Pick<FractionalsTableColumns, 'var' | 'weights'> | null;
}

export function FeatureFlagRule({
  assignedKey,
  className = '',
  defaultConditions = [],
  id,
  newRule = false,
  onRemoveRule,
  orderPosition,
  serveVariationId = null,
  serveFractional = null,
  variations = [],
  segments = [],
}: FeatureFlagRuleProps) {
  const [conditions, setConditions] = useState<RuleConditionWithId[]>(defaultConditions);
  const [summary, setSummary] = useState<Summary>({
    conditions,
    serveVariationId,
    serveFractional: serveFractional ? { var: serveFractional.var, weights: serveFractional.weights } : null,
  });
  const [formInvalid, setFormInvalid] = useState(false);
  const [expanded, setExpanded] = useState(newRule);
  const [serveType, setServeType] = useState(serveFractional ? RuleServeType.Fractional : RuleServeType.Variation);
  const segmentsById = useMemo(() => {
    return mapIdTo(segments, 'key');
  }, [segments]);

  function handleRemoveCondition(id: string) {
    const updatedConditions = conditions.filter((condition) => condition.id !== id);

    setConditions(updatedConditions);
  }

  function handleRemoveRule() {
    onRemoveRule(id);
  }

  function handleCancelEdit() {
    setConditions(defaultConditions);
    setExpanded(false);
  }

  function toggleExpanded() {
    setExpanded(!expanded);
  }

  function handleAddContextCondition() {
    setConditions([
      ...conditions,
      {
        clause: Clause.And,
        context: 'user',
        operator: Operator.LooseEquals,
        values: '',
        id: generateConditionId(id, conditions.length, conditions),
        type: RuleConditionType.Context,
        valuesType: RuleConditionValueType.String,
      },
    ]);
  }

  function handleAddSegmentCondition() {
    setConditions([
      ...conditions,
      {
        clause: Clause.And,
        id: generateConditionId(id, conditions.length, conditions),
        operator: Operator.LooseEquals,
        segmentId: segments[0]?.id || '',
        type: RuleConditionType.Segment,
      },
    ]);
  }

  function handleAddTimeCondition() {
    setConditions([
      ...conditions,
      {
        clause: Clause.And,
        endDate: null,
        id: generateConditionId(id, conditions.length, conditions),
        operator: Operator.GreaterThan,
        startDate: new Date().toISOString(),
        startDateTimeZone: getCurrentTimeZone(),
        endDateTimeZone: getCurrentTimeZone(),
        type: RuleConditionType.Time,
      },
    ]);
  }

  function handleRuleServeChange(event: ChangeEvent<HTMLSelectElement>) {
    setServeType(event.target.value === WEIGHTED_ROLLOUT_ID ? RuleServeType.Fractional : RuleServeType.Variation);
  }

  function handleInvalid() {
    setFormInvalid(true);
  }

  function handleFieldsetChange(event: ChangeEvent<HTMLFieldSetElement>) {
    const fieldsetInvalid = event.currentTarget.matches(':invalid');

    setFormInvalid(fieldsetInvalid);
  }

  function handleBlur(event: FocusEvent<HTMLFieldSetElement>) {
    if (event.currentTarget.form) {
      const formData = new FormData(event.currentTarget.form);
      const rule = parseFeatureFlagRule(formData, assignedKey, orderPosition);
      const fractional = rule.serve ? { var: rule.serve.value.var, weights: rule.serve.value.weights } : null;
      setSummary({ conditions: rule.conditions, serveVariationId: rule.serveVariationId, serveFractional: fractional });
    }
  }

  return (
    <div id={`rule-${id}`} className={classNames(styles.root, className)}>
      <RuleHeadingTile
        hasErrors={formInvalid}
        heading={newRule ? 'New Rule' : assignedKey}
        label="Rule key"
        onEdit={toggleExpanded}
        onRemove={handleRemoveRule}
      />
      <ExpandableTile onClick={toggleExpanded} expanded={expanded}>
        <TileAboveTheFoldContent>
          <div className={styles.above}>
            <RuleSummary
              segments={segmentsById}
              conditions={summary.conditions}
              variations={variations}
              serveVariationId={summary.serveVariationId}
              serveFractional={summary.serveFractional}
            />
            {expanded && (
              <Button
                kind="ghost"
                size="sm"
                className={styles.cancelButton}
                onClick={handleCancelEdit}
                disabled={!expanded}
              >
                Cancel edit
              </Button>
            )}
          </div>
          <CircleBadge label={String(orderPosition + 1)} className={styles.orderPosition} />
        </TileAboveTheFoldContent>
        <TileBelowTheFoldContent>
          <Layer>
            <Stack
              gap={5}
              className={styles.conditions}
              as="fieldset"
              onInvalid={handleInvalid}
              onChange={handleFieldsetChange}
              onBlur={handleBlur}
            >
              <RuleKeyInput ruleId={id} newRule={newRule} defaultValue={assignedKey} />
              <Divider />
              <span className={classNames('cds--label', styles.label)}>Conditions</span>
              {conditions.map((condition, index) => {
                const standardConditional = index ? RuleConditional.And : RuleConditional.If;

                if (condition.type === RuleConditionType.Context) {
                  return (
                    <ContextRuleCondition
                      id={condition.id}
                      attribute={condition.attribute}
                      conditional={standardConditional}
                      context={condition.context}
                      key={condition.id}
                      onRemove={handleRemoveCondition}
                      operator={condition.operator}
                      position={index}
                      ruleId={id}
                      values={condition.values}
                      valuesType={condition.valuesType}
                    />
                  );
                }
                if (condition.type === RuleConditionType.Segment) {
                  return (
                    <SegmentRuleCondition
                      conditional={index ? SegmentRuleConditional.AndContext : SegmentRuleConditional.IfContext}
                      id={condition.id}
                      key={condition.id}
                      onRemove={handleRemoveCondition}
                      operator={condition.operator}
                      position={index}
                      ruleId={id}
                      segmentId={condition.segmentId}
                      segments={segments}
                    />
                  );
                }

                return (
                  <TimeRuleCondition
                    conditional={standardConditional}
                    endDate={condition.endDate}
                    endDateTimeZone={condition.endDateTimeZone}
                    id={condition.id}
                    key={condition.id}
                    onRemove={handleRemoveCondition}
                    operator={condition.operator}
                    ruleId={id}
                    startDate={condition.startDate}
                    startDateTimeZone={condition.startDateTimeZone}
                  />
                );
              })}
              {!conditions.length
                ? 'This rule has no conditions yet. Add one or more conditions to define when this rule applies.'
                : null}
              <MenuButton label="Add condition" menuAlignment="bottom-end" kind="tertiary">
                <MenuItem label="Context condition" onClick={handleAddContextCondition} />
                <MenuItem label="Segment condition" onClick={handleAddSegmentCondition} />
                <MenuItem label="Time condition" onClick={handleAddTimeCondition} />
              </MenuButton>
              <Divider />
              <RuleServeSelect
                variationId={serveVariationId}
                onChange={handleRuleServeChange}
                variations={variations}
                fractionalId={serveFractional?.id}
              />
              {serveType === RuleServeType.Fractional ? (
                <WeightRollout
                  varValue={serveFractional?.var}
                  weights={serveFractional?.weights}
                  variations={variations}
                  ruleOrderPosition={orderPosition}
                />
              ) : null}
              <input type="hidden" name="serveType" value={serveType} />
            </Stack>
          </Layer>
        </TileBelowTheFoldContent>
      </ExpandableTile>
    </div>
  );
}
