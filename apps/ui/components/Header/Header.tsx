// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import Image from 'next/image';

import packageJson from '../../package.json';
import logo from '../../public/logo.svg';
import { Header as CarbonHeader, HeaderGlobalBar, HeaderName } from '../Carbon';
import { HeaderMenu } from '../HeaderMenu/HeaderMenu';
import { Navigation } from '../Navigation/Navigation';
import styles from './Header.module.scss';

interface HeaderProps {
  authenticated: boolean;
}

export function Header({ authenticated }: HeaderProps) {
  return (
    <CarbonHeader aria-label="Flag Controller">
      <HeaderName href="/flags" prefix="">
        <Image src={logo} width={152} height={33} alt="Logo" className={styles.logo} priority />
      </HeaderName>
      {authenticated && (
        <>
          <Navigation />
          <HeaderGlobalBar className={styles.globalBar}>
            <span className={styles.version}>{`v${packageJson.version}`}</span>
            <HeaderMenu />
          </HeaderGlobalBar>
        </>
      )}
    </CarbonHeader>
  );
}
