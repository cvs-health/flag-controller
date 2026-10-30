// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import { startTransition, type SubmitEvent, useActionState, useEffect, useState } from 'react';
import {
  Clause,
  type ContextRuleCondition,
  type EnvironmentTableColumns,
  Operator,
  RuleConditionType,
  RuleConditionValueType,
  type RulesJoined,
} from 'shared-types';

import styles from './SegmentRules.module.scss';
import type { PendingSegmentRule } from '../../typings/rules';
import updateSegmentRules from '../../actions/updateSegmentRules';
import { ActionStatus } from '../../typings/common';
import { InlineNotification, Tile } from '../../components/Carbon';
import { SegmentRule } from '../SegmentRule/SegmentRule';
import { SubmitButton } from '../../components/SubmitButton/SubmitButton';
import { EnvironmentSwitcher } from '../EnvironmentSwitcher/EnvironmentSwitcher';

interface SegmentRulesProps {
  applicationId: string;
  environmentId: string;
  environments?: EnvironmentTableColumns[];
  existingRules: RulesJoined[];
  segmentId: string;
}

export function SegmentRules({
  applicationId,
  segmentId,
  environmentId,
  existingRules,
  environments = [],
}: SegmentRulesProps) {
  const initialState = { status: ActionStatus.Idle, errorMessage: '' };
  const [formState, formAction] = useActionState(updateSegmentRules, initialState);
  const [rules, setRules] = useState<PendingSegmentRule[]>(existingRules);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(() => {
      formAction(new FormData(event.currentTarget));
    });
  }

  useEffect(() => {
    if (!existingRules.length) {
      setRules([
        {
          conditions: [
            {
              attribute: 'country',
              clause: Clause.If,
              context: 'user',
              operator: Operator.LooseEquals,
              values: 'US',
              type: RuleConditionType.Context,
              valuesType: RuleConditionValueType.String,
            },
          ],
          created: true,
          environmentId,
          id: Math.random().toString(),
          key: '',
          orderPosition: 0,
          segmentId,
          serveFractional: null,
          serveFractionalId: null,
          serveVariationId: null,
          serveVariationKey: null,
        },
      ]);
    } else {
      setRules(existingRules);
    }
  }, [existingRules, environmentId, segmentId]);

  return (
    <form action={formAction} name="segmentRules" onSubmit={handleSubmit}>
      <div className={styles.toolbar}>
        <EnvironmentSwitcher environments={environments} environmentId={environmentId} />
        <div>
          <SubmitButton label="Save" status={formState.status} />
        </div>
      </div>
      {formState.status === ActionStatus.Error ? (
        <InlineNotification
          className={styles.notification}
          hideCloseButton
          kind="error"
          subtitle={formState.errorMessage}
          title="Failed to save changes"
        />
      ) : null}
      {rules.map((rule) => {
        return (
          <Tile key={rule.id} className={styles.rule} id={rule.key}>
            <SegmentRule
              assignedKey={rule.key}
              defaultConditions={rule.conditions as ContextRuleCondition[]}
              id={rule.id}
              newRule={rule.created ?? false}
            />
          </Tile>
        );
      })}
      <input type="hidden" name="applicationId" value={applicationId} readOnly />
      <input type="hidden" name="segmentId" value={segmentId} readOnly />
      <input type="hidden" name="environmentId" value={environmentId} readOnly />
      <input type="hidden" name="rules" value={JSON.stringify(rules) || ''} readOnly />
    </form>
  );
}
