// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import type { SubmitEvent } from 'react';
import { useState } from 'react';
import classNames from 'classnames';

import styles from './LoginForm.module.scss';
import { ActionStatus } from '../../typings/common';
import useGetApiConfigQuery from '../../api/queries/useGetApiConfigQuery';
import { InlineNotification, ModalBody, ModalFooter, ModalHeader } from '../../components/Carbon';
import { SubmitButton } from '../../components/SubmitButton/SubmitButton';
import { authClient } from '../../lib/auth-client';

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const [submitStatus, setSubmitStatus] = useState(ActionStatus.Idle);
  const getApiConfigQuery = useGetApiConfigQuery();
  // The API configures one sign-in method per deployment (AUTH_PROVIDER).
  const [provider] = getApiConfigQuery.data?.authProviders ?? [];

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!provider) {
      return;
    }

    setSubmitStatus(ActionStatus.Pending);

    try {
      const callbackURL = new URL('/flags', window.location.origin).toString();
      await authClient.signIn.social({
        provider: provider.id,
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
        {getApiConfigQuery.isError && (
          <InlineNotification
            hideCloseButton
            kind="error"
            subtitle="Sign-in options could not be loaded. Please refresh the page."
            title="Error authenticating"
          />
        )}
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
        <SubmitButton
          disabled={!provider}
          label={provider ? `Login with ${provider.label}` : 'Login'}
          status={submitStatus}
        />
      </ModalFooter>
    </form>
  );
}
