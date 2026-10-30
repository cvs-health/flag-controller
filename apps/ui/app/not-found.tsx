// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import Link from 'next/link';

import { InlineNotification } from '../components/Carbon';
import styles from './error.module.scss';

export default function NotFound() {
  return (
    <div className={styles.root}>
      <InlineNotification
        className={styles.notification}
        hideCloseButton
        kind="info"
        subtitle="It may have been removed, or the link may be wrong."
        title="We could not find that"
      />
      <Link className={styles.action} href="/flags">
        Back to feature flags
      </Link>
    </div>
  );
}
