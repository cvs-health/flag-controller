// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@carbon/react';
import classNames from 'classnames';
import { RuleSorter } from '../RuleSorter/RuleSorter';
import styles from './RuleActions.module.scss';

interface RuleActionsProps {
  className?: string;
  onMoveDown?: () => void;
  onMoveUp?: () => void;
  onRemove?: () => void;
  onRestore?: () => void;
  removeEnabled: boolean;
  removed: boolean;
}

export function RuleActions({
  className,
  onMoveDown,
  onMoveUp,
  onRemove,
  onRestore,
  removeEnabled,
  removed,
}: RuleActionsProps) {
  return (
    <div className={classNames(styles.root, className)}>
      {removeEnabled && removed ? (
        <Button kind="ghost" size="sm" onClick={onRestore}>
          Undo rule removal
        </Button>
      ) : null}
      {removeEnabled && !removed ? (
        <Button size="sm" kind="danger--ghost" onClick={onRemove}>
          Remove
        </Button>
      ) : null}
      {onMoveUp && onMoveDown && !removed ? <RuleSorter onMoveDown={onMoveDown} onMoveUp={onMoveUp} /> : null}
    </div>
  );
}
