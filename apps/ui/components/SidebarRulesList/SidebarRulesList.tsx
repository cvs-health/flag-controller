// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { useEffect } from 'react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import styles from './SidebarRulesList.module.scss';
import { SidebarDefaultRuleItem } from '../SidebarDefaultRuleItem/SidebarDefaultRuleItem';
import { SidebarRuleItem } from '../SidebarRuleItem/SidebarRuleItem';

export interface Rule {
  id: string;
  key: string;
}

interface SidebarRulesListProps {
  rules: Rule[];
  onReorderRules: (fromPosition: number, toPosition: number) => void;
}

export function SidebarRulesList({ rules, onReorderRules }: SidebarRulesListProps) {
  const dragDisabled = rules.length < 2;

  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) {
          return;
        }

        const fromPosition = source.data.index as number;
        const toPosition = destination.data.index as number;

        if (fromPosition === toPosition) {
          return;
        }

        onReorderRules(fromPosition, toPosition);
      },
    });
  }, [onReorderRules]);

  return (
    <div>
      <h3 className={styles.title}>Rules</h3>
      {dragDisabled ? null : <p className={styles.description}>Drag and drop rules to adjust the order</p>}
      <div className={styles.list}>
        {rules.map((rule, index) => (
          <SidebarRuleItem
            key={rule.id}
            ruleId={rule.id}
            ruleKey={rule.key}
            orderPosition={index}
            draggable={!dragDisabled}
          />
        ))}
        <SidebarDefaultRuleItem />
      </div>
    </div>
  );
}
