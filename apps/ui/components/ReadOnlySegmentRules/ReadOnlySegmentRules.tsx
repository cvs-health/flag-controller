// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import type { ContextRuleCondition, EnvironmentTableColumns, RulesJoined } from 'shared-types';

import styles from './ReadOnlySegmentRules.module.scss';
import { EnvironmentSwitcher } from '../../features/EnvironmentSwitcher/EnvironmentSwitcher';
import { ReadOnlySegmentRule } from '../ReadOnlySegmentRule/ReadOnlySegmentRule';

interface ReadOnlySegmentRulesProps {
  environmentId: string;
  environments?: EnvironmentTableColumns[];
  existingRules: RulesJoined[];
}

export function ReadOnlySegmentRules({ environmentId, existingRules, environments = [] }: ReadOnlySegmentRulesProps) {
  return (
    <div>
      <div className={styles.toolbar}>
        <EnvironmentSwitcher environments={environments} environmentId={environmentId} />
      </div>
      {existingRules.map((rule) => {
        return (
          <ReadOnlySegmentRule
            assignedKey={rule.key}
            defaultConditions={rule.conditions as ContextRuleCondition[]}
            id={rule.id}
            key={rule.id}
          />
        );
      })}
    </div>
  );
}
