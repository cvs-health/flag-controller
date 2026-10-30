// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ChevronDown, ChevronUp } from '@carbon/icons-react';
import classNames from 'classnames';
import { Button } from '../Carbon';
import styles from './RuleSorter.module.scss';

interface RuleSorterProps {
  className?: string;
  onMoveDown: () => void;
  onMoveUp: () => void;
}

export function RuleSorter({ className = '', onMoveDown, onMoveUp }: RuleSorterProps) {
  return (
    <div className={classNames(styles.root, className)}>
      <Button
        className={styles.button}
        onClick={onMoveUp}
        hasIconOnly
        size="sm"
        kind="ghost"
        iconDescription="Move up"
        tooltipPosition="left"
      >
        <ChevronUp size={24} title="Move up" />
      </Button>
      <Button
        className={styles.button}
        onClick={onMoveDown}
        hasIconOnly
        size="sm"
        kind="ghost"
        iconDescription="Move down"
        tooltipPosition="left"
      >
        <ChevronDown size={24} title="Move down" />
      </Button>
    </div>
  );
}
