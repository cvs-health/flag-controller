// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { Tab } from '@carbon/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import styles from './TabLink.module.scss';
import updateSearchParams from '../../utils/updateSearchParams';

interface TabLinkProps {
  label: string;
  id: string;
}

export function TabLink({ label, id }: TabLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleClick() {
    const params = updateSearchParams(searchParams, [['tab', id]]);

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Tab onClick={handleClick} className={styles.root}>
      {label}
    </Tab>
  );
}
