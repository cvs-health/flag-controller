// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import styles from './SidebarDefaultRuleItem.module.scss';

export function SidebarDefaultRuleItem() {
  return (
    <div className={styles.item}>
      <a href="#default-rule" className={styles.link}>
        <span className={styles.name}>default rule</span>
      </a>
    </div>
  );
}
