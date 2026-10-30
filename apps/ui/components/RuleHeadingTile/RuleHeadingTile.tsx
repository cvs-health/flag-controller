// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import classNames from 'classnames';
import { Edit, TrashCan } from '@carbon/icons-react';
import { IconButton, InlineNotification, Section, Stack, Tile } from '@carbon/react';

import styles from './RuleHeadingTile.module.scss';

interface RuleHeadingTileProps {
  hasErrors?: boolean;
  heading: string;
  label: string;
  markedForRemoval?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
}

export default function RuleHeadingTile({
  hasErrors = false,
  heading,
  label,
  markedForRemoval = false,
  onEdit,
  onRemove,
}: RuleHeadingTileProps) {
  return (
    <Tile className={styles.root}>
      {hasErrors && (
        <InlineNotification
          className={styles.errorNotification}
          hideCloseButton
          kind="error"
          subtitle="Please edit and complete the rule."
          title="Rule incomplete."
        />
      )}
      {markedForRemoval && (
        <InlineNotification
          className={styles.notification}
          hideCloseButton
          kind="warning"
          subtitle={`This rule will be removed after clicking "Save rules". Editing this rule is now disabled.`}
          title="Marked for removal"
        />
      )}
      <Section level={3} className={styles.section}>
        <div>
          <span className={classNames('cds--label', styles.label)}>{label}</span>
          <div className={styles.key}>{heading}</div>
        </div>
        <Stack gap={5} orientation="horizontal">
          {onEdit ? (
            <IconButton label="Edit rule" kind="ghost" onClick={onEdit} disabled={markedForRemoval}>
              <Edit />
            </IconButton>
          ) : null}
          {onRemove ? (
            <IconButton label="Remove rule" kind="ghost" onClick={onRemove} disabled={markedForRemoval}>
              <TrashCan />
            </IconButton>
          ) : null}
        </Stack>
      </Section>
    </Tile>
  );
}
