// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { CarbonPictogramType } from '@carbon/pictograms-react';
import { Tile } from '@carbon/react';
import classNames from 'classnames';

import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  body: string;
  className?: string;
  icon: CarbonPictogramType;
  title: string;
}

export function EmptyState({ icon: Icon, title, body, className }: EmptyStateProps) {
  return (
    <Tile className={classNames(styles.root, className)}>
      {<Icon width={48} />}
      <h4>{title}</h4>
      <p>{body}</p>
    </Tile>
  );
}
