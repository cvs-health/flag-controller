// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import styles from './ReadOnlySidebarRulesList.module.scss';
import { SidebarDefaultRuleItem } from '../SidebarDefaultRuleItem/SidebarDefaultRuleItem';
import { SidebarRuleItem } from '../SidebarRuleItem/SidebarRuleItem';

export interface Rule {
  id: string;
  key: string;
}

interface ReadOnlySidebarRulesListProps {
  rules: Rule[];
}

export function ReadOnlySidebarRulesList({ rules }: ReadOnlySidebarRulesListProps) {
  return (
    <div>
      <h3 className={styles.title}>Rules</h3>
      <div className={styles.list}>
        {rules.map((rule, index) => (
          <SidebarRuleItem key={rule.id} ruleId={rule.id} ruleKey={rule.key} orderPosition={index} draggable={false} />
        ))}
        <SidebarDefaultRuleItem />
      </div>
    </div>
  );
}
