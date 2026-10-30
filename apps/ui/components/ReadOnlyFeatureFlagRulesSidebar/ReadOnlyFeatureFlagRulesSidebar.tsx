// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames';
import type { FeatureFlagType, FlagVariationsTableColumns, RulesJoined } from 'shared-types';

import Divider from '../Divider/Divider';
import styles from './ReadOnlyFeatureFlagRulesSidebar.module.scss';
import type { SegmentWithRules } from '../../typings/segments';
import { ReadOnlySidebarRulesList } from '../ReadOnlySidebarRulesList/ReadOnlySidebarRulesList';
import { RunEvaluations } from '../../features/RunEvaluations/RunEvaluations';

interface ReadOnlyFeatureFlagRulesSidebarProps {
  applicationId: string;
  className?: string;
  defaultVariationKey: string;
  featureFlagType: FeatureFlagType;
  rules: RulesJoined[];
  segments: SegmentWithRules[];
  variations: FlagVariationsTableColumns[];
}

export function ReadOnlyFeatureFlagRulesSidebar({
  applicationId,
  className = '',
  defaultVariationKey,
  featureFlagType,
  rules,
  segments,
  variations,
}: ReadOnlyFeatureFlagRulesSidebarProps) {
  return (
    <aside className={classNames(styles.root, className)}>
      <div className={styles.content}>
        <RunEvaluations
          applicationId={applicationId}
          defaultVariationKey={defaultVariationKey}
          featureFlagRules={rules}
          featureFlagType={featureFlagType}
          segments={segments}
          variations={variations}
        />
        <Divider />
        <ReadOnlySidebarRulesList rules={rules} />
      </div>
    </aside>
  );
}
