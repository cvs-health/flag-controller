// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import classNames from 'classnames';

import styles from './Labeled.module.scss';

export enum LabeledLabelSize {
  Small = 'small',
  Medium = 'medium',
}

interface LabeledProps {
  className?: string;
  children: React.ReactNode;
  label: string;
  labelSize?: LabeledLabelSize;
}

export function Labeled({ className = '', children, label, labelSize = LabeledLabelSize.Small }: LabeledProps) {
  return (
    <div className={className}>
      <div className={classNames(styles[labelSize], styles.label)}>{label}</div>
      {children}
    </div>
  );
}
