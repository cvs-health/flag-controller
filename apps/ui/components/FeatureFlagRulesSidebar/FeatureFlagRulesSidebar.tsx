// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import classNames from 'classnames';
import { Button, Stack } from '@carbon/react';
import type { FeatureFlagType, FlagVariationsTableColumns } from 'shared-types';

import Divider from '../Divider/Divider';
import styles from './FeatureFlagRulesSidebar.module.scss';
import type { PendingFeatureFlagRule } from '../../typings/rules';
import { RunEvaluations } from '../../features/RunEvaluations/RunEvaluations';
import type { SegmentWithRules } from '../../typings/segments';
import { SidebarRulesList } from '../SidebarRulesList/SidebarRulesList';

interface FeatureFlagRulesSidebarProps {
  applicationId: string;
  children?: React.ReactNode;
  className?: string;
  defaultVariationKey: string;
  environmentId: string;
  featureFlagType: FeatureFlagType;
  onAddRule: () => void;
  onReorderRules: (fromPosition: number, toPosition: number) => void;
  rules: PendingFeatureFlagRule[];
  segments: SegmentWithRules[];
  variations: FlagVariationsTableColumns[];
}

export function FeatureFlagRulesSidebar({
  applicationId,
  children,
  className = '',
  defaultVariationKey,
  featureFlagType,
  onAddRule,
  onReorderRules,
  rules,
  segments,
  variations,
}: FeatureFlagRulesSidebarProps) {
  return (
    <aside className={classNames(styles.root, className)}>
      <Stack className={styles.actions} orientation="horizontal" gap={5}>
        <Button kind="secondary" onClick={onAddRule} className={styles.addRule}>
          Add rule
        </Button>
        {children}
      </Stack>
      <Divider />
      <div className={styles.content}>
        <RunEvaluations
          defaultVariationKey={defaultVariationKey}
          segments={segments}
          variations={variations}
          featureFlagType={featureFlagType}
          applicationId={applicationId}
        />
        <Divider />
        <SidebarRulesList rules={rules} onReorderRules={onReorderRules} />
      </div>
    </aside>
  );
}
