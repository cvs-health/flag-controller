// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import type { SubmitEvent } from 'react';
import { useState } from 'react';
import classNames from 'classnames';

import styles from './LoginForm.module.scss';
import { ActionStatus } from '../../typings/common';
import { InlineNotification, ModalBody, ModalFooter, ModalHeader } from '../../components/Carbon';
import { SubmitButton } from '../../components/SubmitButton/SubmitButton';
import { authClient } from '../../lib/auth-client';

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const [submitStatus, setSubmitStatus] = useState(ActionStatus.Idle);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setSubmitStatus(ActionStatus.Pending);

    try {
      const callbackURL = new URL('/flags', window.location.origin).toString();
      await authClient.signIn.social({
        provider: 'github',
        callbackURL,
      });
    } catch (_error) {
      setSubmitStatus(ActionStatus.Error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={classNames(styles.form, className)}>
      <ModalHeader title="Welcome" />
      <ModalBody>
        {submitStatus === ActionStatus.Error && (
          <InlineNotification
            hideCloseButton
            kind="error"
            subtitle="There was an error authenticating. Please try again."
            title="Error authenticating"
          />
        )}
      </ModalBody>
      <ModalFooter>
        <SubmitButton label="Login" status={submitStatus} />
      </ModalFooter>
    </form>
  );
}
