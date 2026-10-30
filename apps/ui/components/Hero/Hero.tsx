// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames';
import type { ReactNode } from 'react';

import { Stack, Tile } from '../Carbon';
import styles from './Hero.module.scss';

interface HeroDetail {
  data?: ReactNode;
  label: string;
  sublabel?: ReactNode;
}

interface HeroProps {
  children?: ReactNode;
  details: HeroDetail[];
}

export function Hero({ children = null, details }: HeroProps) {
  return (
    <Tile className={styles.root}>
      <Stack className={styles.details} gap={8} orientation="horizontal">
        {details.map((item, index) => (
          <div className={styles.column} key={item.label}>
            <div className={styles.label}>{item.label}</div>
            {index ? (
              <div className={styles.data}>{item.data || '-'}</div>
            ) : (
              <h1 className={classNames(styles.data, styles.context)}>{item.data || '-'}</h1>
            )}
            <div className={styles.sublabel}>{item.sublabel}</div>
          </div>
        ))}
      </Stack>
      {children}
    </Tile>
  );
}
