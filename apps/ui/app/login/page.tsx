// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { LoginForm } from '../../features/LoginForm/LoginForm';
import LoginFooterLinks from './LoginFooterLinks';
import styles from './page.module.scss';

interface LoginProps {
  searchParams: Promise<Record<'error', string | undefined>>;
}

export default async function Login({ searchParams }: LoginProps) {
  const { error } = await searchParams;

  return (
    <div className={styles.root}>
      <LoginForm className={styles.login} signInError={error} />
      <LoginFooterLinks />
    </div>
  );
}
