// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Activity, Fragment, useMemo, useState } from 'react';
import type { FlagVariationsTableColumns, SegmentsTableColumns } from 'shared-types';
import { Stack } from '@carbon/react';

import type { PendingFeatureFlagRule } from '../../typings/rules';
import { FeatureFlagRule } from '../FeatureFlagRule/FeatureFlagRule';
import { DefaultRule } from '../DefaultRule/DefaultRule';
import { ReadOnlyFeatureFlagRule } from '../../components/ReadOnlyFeatureFlagRule/ReadOnlyFeatureFlagRule';
import generateConditionId from '../../utils/generateConditionId';

interface RulesListProps {
  defaultVariationId: string;
  rules: PendingFeatureFlagRule[];
  segments: SegmentsTableColumns[];
  variations: FlagVariationsTableColumns[];
}

export default function RulesList({ defaultVariationId, rules, segments, variations }: RulesListProps) {
  const [markedForRemoval, setMarkedForRemoval] = useState<Record<string, boolean>>({});
  const rulesWithIdConditions = useMemo(
    () =>
      rules.map((rule) => ({
        ...rule,
        conditions: rule.conditions.map((condition, conditionIndex) => ({
          ...condition,
          id: generateConditionId(rule.id, conditionIndex),
        })),
      })),
    [rules],
  );

  function handleRemoveRule(ruleId: string) {
    setMarkedForRemoval({ ...markedForRemoval, [ruleId]: true });
  }

  function handleCancelRemoval(ruleId: string) {
    setMarkedForRemoval({ ...markedForRemoval, [ruleId]: false });
  }

  return (
    <Stack gap={7}>
      {rulesWithIdConditions.map((rule, index) => {
        const ruleMarkedForRemoval = markedForRemoval[rule.id] ?? false;
        const newRule = 'created' in rule ? rule.created : false;

        if (ruleMarkedForRemoval && newRule) {
          return null;
        }

        return (
          <Fragment key={rule.id}>
            <Activity key={rule.id} mode={!ruleMarkedForRemoval ? 'visible' : 'hidden'}>
              <FeatureFlagRule
                assignedKey={rule.key}
                defaultConditions={rule.conditions}
                id={rule.id}
                newRule={newRule}
                onRemoveRule={handleRemoveRule}
                orderPosition={index}
                segments={segments}
                serveFractional={rule.serveFractional}
                serveVariationId={rule.serveVariationId}
                variations={variations}
              />
            </Activity>
            {ruleMarkedForRemoval ? (
              <ReadOnlyFeatureFlagRule
                assignedKey={rule.key}
                conditions={rule.conditions}
                id={rule.id}
                markedForRemoval
                onCancelRemoval={handleCancelRemoval}
                orderPosition={index}
                segments={segments}
                serveFractional={rule.serveFractional}
                serveVariationId={rule.serveVariationId}
                variations={variations}
              />
            ) : null}
            <input type="hidden" name="removed" value={String(ruleMarkedForRemoval)} readOnly />
            <input type="hidden" name="id" value={rule.id} readOnly />
            <input type="hidden" name="created" value={newRule?.toString() || 'false'} readOnly />
          </Fragment>
        );
      })}

      <DefaultRule defaultVariationId={defaultVariationId} variations={variations} />
    </Stack>
  );
}
