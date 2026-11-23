// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import type { SubmitEvent } from 'react';
import { useState } from 'react';
import classNames from 'classnames';
import { SignInErrorCode } from 'shared-types';

import styles from './LoginForm.module.scss';
import { ActionStatus } from '../../typings/common';
import useGetApiConfigQuery from '../../api/queries/useGetApiConfigQuery';
import { InlineNotification, ModalBody, ModalFooter, ModalHeader } from '../../components/Carbon';
import { SubmitButton } from '../../components/SubmitButton/SubmitButton';
import { authClient } from '../../lib/auth-client';

interface LoginFormProps {
  className?: string;
  /** Error code the API adds to the redirect when it rejects a sign-in. */
  signInError?: string;
}

const accountNotLinked = 'An account with your email address already exists. Contact your administrator.';

// Fixed messages, so a crafted link can't put its own text on the login page.
const signInErrorMessages: Record<string, string> = {
  [SignInErrorCode.EmailDomainNotAllowed]:
    'Your email domain is not allowed to sign in. Use your organization account.',
  [SignInErrorCode.ClaimNotAllowed]: 'Your account is not allowed to sign in to this deployment.',
  [SignInErrorCode.EmailNotVerified]:
    'Your email address is not verified. Verify it with your identity provider, then try again.',
  [SignInErrorCode.ExternalIdMissing]:
    'Your identity provider did not send an account identifier. Contact your administrator.',
  [SignInErrorCode.ProtocolNotSupported]:
    'Your identity provider uses a sign-in protocol this deployment does not support. Contact your administrator.',
  // Better Auth's own code: SSO sends it with spaces, the GitHub callback with underscores.
  'account not linked': accountNotLinked,
  account_not_linked: accountNotLinked,
} satisfies Record<SignInErrorCode | 'account not linked' | 'account_not_linked', string>;

export function LoginForm({ className, signInError }: LoginFormProps) {
  const [submitStatus, setSubmitStatus] = useState(ActionStatus.Idle);
  const getApiConfigQuery = useGetApiConfigQuery();
  // One provider per deployment.
  const [provider] = getApiConfigQuery.data?.authProviders ?? [];

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!provider) {
      return;
    }

    setSubmitStatus(ActionStatus.Pending);

    try {
      const callbackURL = new URL('/flags', window.location.origin).toString();
      const errorCallbackURL = new URL('/login', window.location.origin).toString();

      if (provider.kind === 'oidc') {
        await authClient.signIn.sso({ providerId: provider.id, callbackURL, errorCallbackURL });
      } else {
        await authClient.signIn.social({ provider: provider.id, callbackURL, errorCallbackURL });
      }
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
            title="Sign-in unavailable"
          />
        )}
        {signInError && (
          <InlineNotification
            hideCloseButton
            kind="error"
            subtitle={
              signInErrorMessages[signInError] ?? 'Sign-in failed. Please try again or contact your administrator.'
            }
            title="Sign-in rejected"
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
          label={provider?.label ? `Login with ${provider.label}` : 'Login'}
          status={submitStatus}
        />
      </ModalFooter>
    </form>
  );
}
