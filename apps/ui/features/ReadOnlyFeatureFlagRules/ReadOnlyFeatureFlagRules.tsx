// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { ContentSwitcher, SkeletonPlaceholder, Stack, Switch } from '@carbon/react';
import { useMemo, useTransition } from 'react';
import { EnvironmentKey, type RulesJoined, type FeatureFlagType, type FlagVariationsTableColumns } from 'shared-types';
import type { SegmentWithRules } from '../../typings/segments';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import styles from './ReadOnlyFeatureFlagRules.module.scss';
import type { SwitchEventHandlersParams } from '../../typings/carbon';
import updateSearchParams from '../../utils/updateSearchParams';
import { ReadOnlyFeatureFlagRule } from '../../components/ReadOnlyFeatureFlagRule/ReadOnlyFeatureFlagRule';
import { ReadOnlyDefaultRule } from '../../components/ReadOnlyDefaultRule/ReadOnlyDefaultRule';
import { ReadOnlyFeatureFlagRulesSidebar } from '../../components/ReadOnlyFeatureFlagRulesSidebar/ReadOnlyFeatureFlagRulesSidebar';
import { environmentLabels } from '../../constants/common';

interface ReadOnlyFeatureFlagRulesProps {
  applicationId: string;
  defaultVariationKey: string;
  defaultVariationId: string;
  environmentKey: EnvironmentKey;
  featureFlagRules: RulesJoined[];
  featureFlagType: FeatureFlagType;
  segments: SegmentWithRules[];
  variations: FlagVariationsTableColumns[];
}

export function ReadOnlyFeatureFlagRules({
  applicationId,
  defaultVariationKey,
  defaultVariationId,
  environmentKey,
  featureFlagRules,
  featureFlagType,
  segments,
  variations,
}: ReadOnlyFeatureFlagRulesProps) {
  const [isTransitionPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const environmentKeys = {
    [EnvironmentKey.Development]: 0,
    [EnvironmentKey.Production]: 1,
  };
  const selectedEnvironmentIndex = environmentKeys[environmentKey] ?? 0;
  const rulesWithIdConditions = useMemo(
    () =>
      featureFlagRules.map((rule) => ({
        ...rule,
        conditions: rule.conditions.map((condition) => ({ ...condition, id: Math.random().toString() })),
      })),
    [featureFlagRules],
  );

  function handleEnvironmentChange(event: SwitchEventHandlersParams) {
    const params = updateSearchParams(searchParams, [['rulesEnvironment', event.name as EnvironmentKey]]);

    startTransition(() => {
      router.push(`${pathname}?${params}`, { scroll: false });
    });
  }

  return (
    <Stack orientation="horizontal" gap={7} className={styles.root}>
      <div>
        <div className={styles.toolbar}>
          <ContentSwitcher
            className={styles.switcher}
            onChange={handleEnvironmentChange}
            selectedIndex={selectedEnvironmentIndex}
            selectionMode="manual"
            size="lg"
          >
            {Object.entries(environmentLabels).map(([key, label]) => (
              <Switch key={key} name={key} text={label} />
            ))}
          </ContentSwitcher>
        </div>
        {isTransitionPending ? (
          <SkeletonPlaceholder className={styles.skeleton} />
        ) : (
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
        )}
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
