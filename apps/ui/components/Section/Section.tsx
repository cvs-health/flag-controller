// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { gray10 } from '@carbon/colors';
import classNames from 'classnames';
import type { ReactNode } from 'react';

import { Section as CarbonSection, Heading, Tile } from '../Carbon';
import styles from './Section.module.scss';

interface SectionProps {
  children?: ReactNode;
  className?: string;
  description?: string;
  heading: string;
}

export function Section({ heading, description, children, className }: SectionProps) {
  return (
    <Tile color={gray10} className={classNames(styles.root, className)}>
      <div>
        <CarbonSection level={2}>
          <Heading className={styles.heading}>{heading}</Heading>
        </CarbonSection>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {children}
    </Tile>
  );
}
