// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { Launch } from '@carbon/icons-react';

import { Link } from '../Carbon';
import styles from './ExternalLink.module.scss';

interface ExternalLinkProps {
  href: string;
  label: string;
}

export function ExternalLink({ label, href }: ExternalLinkProps) {
  return (
    <Link href={href} renderIcon={Launch} size="lg" className={styles.root} target="_blank" rel="noopener noreferrer">
      {label}
    </Link>
  );
}
