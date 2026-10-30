// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { LoginForm } from '../../features/LoginForm/LoginForm';
import LoginFooterLinks from './LoginFooterLinks';
import styles from './page.module.scss';

export default async function Login() {
  return (
    <div className={styles.root}>
      <LoginForm className={styles.login} />
      <LoginFooterLinks />
    </div>
  );
}
