// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { Stack } from '@carbon/react';
import { useMemo } from 'react';
import type { RulesJoined, FeatureFlagType, FlagVariationsTableColumns, FeatureFlagEnvironmentsJoined } from 'shared-types';

import styles from './ReadOnlyFeatureFlagRules.module.scss';
import type { SegmentWithRules } from '../../typings/segments';
import { EnvironmentSwitcher } from '../EnvironmentSwitcher/EnvironmentSwitcher';
import { ReadOnlyDefaultRule } from '../../components/ReadOnlyDefaultRule/ReadOnlyDefaultRule';
import { ReadOnlyFeatureFlagRule } from '../../components/ReadOnlyFeatureFlagRule/ReadOnlyFeatureFlagRule';
import { ReadOnlyFeatureFlagRulesSidebar } from '../../components/ReadOnlyFeatureFlagRulesSidebar/ReadOnlyFeatureFlagRulesSidebar';

interface ReadOnlyFeatureFlagRulesProps {
  applicationId: string;
  defaultVariationKey: string;
  defaultVariationId: string;
  environmentId: string;
  environments?: FeatureFlagEnvironmentsJoined[];
  featureFlagRules: RulesJoined[];
  featureFlagType: FeatureFlagType;
  segments: SegmentWithRules[];
  variations: FlagVariationsTableColumns[];
}

export function ReadOnlyFeatureFlagRules({
  applicationId,
  defaultVariationKey,
  defaultVariationId,
  environmentId,
  environments = [],
  featureFlagRules,
  featureFlagType,
  segments,
  variations,
}: ReadOnlyFeatureFlagRulesProps) {
  const rulesWithIdConditions = useMemo(
    () =>
      featureFlagRules.map((rule) => ({
        ...rule,
        conditions: rule.conditions.map((condition) => ({ ...condition, id: Math.random().toString() })),
      })),
    [featureFlagRules],
  );
  const normalizedEnvironments = useMemo(
    () => environments.map((environment) => ({ id: environment.environmentId, key: environment.environmentKey })),
    [environments],
  );

  return (
    <Stack orientation="horizontal" gap={7} className={styles.root}>
      <div>
        <div className={styles.toolbar}>
          <EnvironmentSwitcher environments={normalizedEnvironments} environmentId={environmentId} />
        </div>
          <Stack gap={7}>
            {rulesWithIdConditions.map((rule, index) => (
              <ReadOnlyFeatureFlagRule
                assignedKey={rule.key}
                conditions={rule.conditions}
                id={rule.id}
                key={rule.id}
                orderPosition={index}
                segments={segments}
                serveFractional={rule.serveFractional}
                serveVariationId={rule.serveVariationId}
                variations={variations}
              />
            ))}
            <ReadOnlyDefaultRule defaultVariationId={defaultVariationId} variations={variations} />
          </Stack>
      </div>
      <ReadOnlyFeatureFlagRulesSidebar
        applicationId={applicationId}
        className={styles.sidebar}
        defaultVariationKey={defaultVariationKey}
        featureFlagType={featureFlagType}
        rules={rulesWithIdConditions}
        segments={segments}
        variations={variations}
      />
    </Stack>
  );
}
