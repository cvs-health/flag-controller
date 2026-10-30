// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Archive, CheckmarkOutline, Edit, IntentRequestCreate, Reset, TrashCan, Undefined } from '@carbon/icons-react';
import { Tag, type TagProps } from '@carbon/react';
import { ActionType } from 'shared-types';

import { actionLabels } from '../../constants/common';
import styles from './ActionTag.module.scss';

interface ActionTagProps {
  action: ActionType;
}

const actionComponents = {
  [ActionType.Archive]: Archive,
  [ActionType.Create]: IntentRequestCreate,
  [ActionType.Delete]: TrashCan,
  [ActionType.Disable]: Undefined,
  [ActionType.Edit]: Edit,
  [ActionType.Enable]: CheckmarkOutline,
  [ActionType.Restore]: Reset,
};
const actionColors = {
  [ActionType.Archive]: 'blue',
  [ActionType.Create]: 'green',
  [ActionType.Delete]: 'red',
  [ActionType.Disable]: 'gray',
  [ActionType.Edit]: 'yellow',
  [ActionType.Enable]: 'teal',
  [ActionType.Restore]: 'purple',
};

export function ActionTag({ action }: ActionTagProps) {
  const IconComponent = actionComponents[action];
  const actionLabel = actionLabels[action];
  const actionColor = actionColors[action] as TagProps<'div'>['type'];

  return (
    <Tag
      type={actionColor}
      size="md"
      renderIcon={() => (IconComponent ? <IconComponent title={actionLabel} /> : null)}
      id={action}
      className={styles[`${action}ActionTag`]}
    >
      {actionLabel}
    </Tag>
  );
}
