// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import classNames from 'classnames';
import { Draggable } from '@carbon/icons-react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable as pdraggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEffect, useRef, useState } from 'react';

import styles from './SidebarRuleItem.module.scss';

interface SidebarRuleItemProps {
  draggable?: boolean;
  orderPosition: number;
  ruleId: string;
  ruleKey: string;
}

export function SidebarRuleItem({ draggable = true, ruleId, ruleKey, orderPosition }: SidebarRuleItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const element = ref.current;
    const dragHandle = dragHandleRef.current;

    if (!element || !dragHandle || !draggable) {
      return;
    }

    return combine(
      pdraggable({
        element,
        dragHandle,
        getInitialData: () => ({ index: orderPosition }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        getData: () => ({ index: orderPosition }),
        onDragEnter: () => setIsOver(true),
        onDragLeave: () => setIsOver(false),
        onDrop: () => setIsOver(false),
      }),
    );
  }, [orderPosition, draggable]);

  return (
    <div ref={ref} className={classNames(styles.item, isDragging && styles.isDragging, isOver && styles.isOver)}>
      <a href={`#rule-${ruleId}`} className={styles.link}>
        <span className={styles.number}>{orderPosition + 1}.</span>
        <span className={styles.name}>{ruleKey || 'New rule'}</span>
      </a>
      {draggable && (
        <div ref={dragHandleRef} className={styles.dragHandle}>
          <Draggable size={16} />
        </div>
      )}
    </div>
  );
}
