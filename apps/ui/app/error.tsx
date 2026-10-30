// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { useEffect } from 'react';

import { Button, InlineNotification } from '../components/Carbon';
import { isApiError } from '../utils/ApiError';
import styles from './error.module.scss';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// ApiError.message is allow-listed copy; anything else is not safe to render.
function messageFor(error: Error) {
  return isApiError(error) ? error.message : 'Something went wrong on our end. Try again in a moment.';
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.root}>
      <InlineNotification
        className={styles.notification}
        hideCloseButton
        kind="error"
        subtitle={messageFor(error)}
        title="This page could not be loaded"
      />
      <Button className={styles.action} kind="tertiary" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
