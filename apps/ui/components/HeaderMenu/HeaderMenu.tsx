// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import classNames from 'classnames';
import { HeaderGlobalAction, HeaderPanel, MenuItem, MenuItemDivider } from '@carbon/react';
import { Menu } from '@carbon/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './HeaderMenu.module.scss';
import { authClient } from '../../lib/auth-client';

export function HeaderMenu() {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleToggle() {
    setOpen(!open);
  }

  // TODO: Handle errors and loading state
  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
          handleToggle();
        },
      },
    });
  }

  return (
    <>
      <HeaderGlobalAction
        aria-label="Header menu"
        tooltipAlignment="end"
        onClick={handleToggle}
        isActive={open}
        className={classNames(open && styles.open)}
      >
        <Menu size={20} />
      </HeaderGlobalAction>
      <HeaderPanel expanded={open} className={styles.headerPanel}>
        <ul>
          <MenuItem
            label="Support channel"
            onClick={() =>
              window.open(
                t(($) => $.login.supportUrl),
                '_blank',
              )
            }
          />
          <MenuItem
            label={t(($) => $.ui.documentationLabel)}
            onClick={() =>
              window.open(
                t(($) => $.ui.documentationUrl),
                '_blank',
              )
            }
          />
          <MenuItemDivider />
          <MenuItem label="Log out" onClick={handleLogout} />
        </ul>
      </HeaderPanel>
    </>
  );
}
