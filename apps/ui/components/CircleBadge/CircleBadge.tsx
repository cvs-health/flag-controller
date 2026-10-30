// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames';

import styles from './CircleBadge.module.scss';

interface CircleBadgeProps {
  className?: string;
  label: string;
}

export default function CircleBadge({ className = '', label }: CircleBadgeProps) {
  return <div className={classNames(styles.root, className)}>{label}</div>;
}
