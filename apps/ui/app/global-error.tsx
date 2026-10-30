// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { useEffect } from 'react';

import { Button, InlineNotification } from '../components/Carbon';
import './globals.scss';
import styles from './error.module.scss';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className={styles.root}>
          <InlineNotification
            className={styles.notification}
            hideCloseButton
            kind="error"
            subtitle="Something went wrong on our end. Try again in a moment."
            title="This page could not be loaded"
          />
          <Button className={styles.action} kind="tertiary" onClick={reset}>
            Try again
          </Button>
        </main>
      </body>
    </html>
  );
}
