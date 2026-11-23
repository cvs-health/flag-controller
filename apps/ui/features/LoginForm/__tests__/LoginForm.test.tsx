// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LoginForm } from '../LoginForm';
import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { authClient } from '../../../lib/auth-client';

const githubConfig = {
  authProviders: [{ id: 'github', label: 'GitHub', kind: 'social' }],
  features: {},
  modes: {},
};

const redirects = {
  callbackURL: 'http://localhost:3000/flags',
  errorCallbackURL: 'http://localhost:3000/login',
};

describe('LoginForm', () => {
  it('signs in with the provider the API reports', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(githubConfig));
    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Login with GitHub' }));

    await waitFor(() => expect(authClient.signIn.social).toHaveBeenCalledWith({ provider: 'github', ...redirects }));
  });

  it('does not assume GitHub when the API reports another provider', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithData({
        ...githubConfig,
        authProviders: [{ id: 'gitlab', label: 'GitLab', kind: 'social' }],
      }),
    );
    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Login with GitLab' }));

    await waitFor(() => expect(authClient.signIn.social).toHaveBeenCalledWith({ provider: 'gitlab', ...redirects }));
  });

  it('starts the OpenID Connect flow for an oidc provider', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithData({
        ...githubConfig,
        authProviders: [{ id: 'corp', label: 'App Registry', kind: 'oidc' }],
      }),
    );
    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Login with App Registry' }));

    await waitFor(() => expect(authClient.signIn.sso).toHaveBeenCalledWith({ providerId: 'corp', ...redirects }));
    expect(authClient.signIn.social).not.toHaveBeenCalled();
  });

  it('uses a generic label and still signs in when the API omits the provider label', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithData({
        ...githubConfig,
        authProviders: [{ id: 'corp', kind: 'oidc' }],
      }),
    );
    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>,
    );

    // The button reads "Login" while loading too, so wait for it to enable.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Login' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(authClient.signIn.sso).toHaveBeenCalledWith({ providerId: 'corp', ...redirects }));
  });

  it('keeps the button disabled until the API has answered', () => {
    vi.spyOn(global, 'fetch').mockReturnValueOnce(new Promise(() => {}));
    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>,
    );

    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  it('shows an error when login fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(githubConfig));
    vi.mocked(authClient.signIn.social).mockRejectedValueOnce(new Error('Authentication failed'));
    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Login with GitHub' }));

    expect(await screen.findByText('There was an error authenticating. Please try again.')).toBeInTheDocument();
  });

  it('shows an error instead of an empty page when the API cannot be reached', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new TypeError('fetch failed'));
    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>,
    );

    expect(
      await screen.findByText('Sign-in options could not be loaded. Please refresh the page.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  it.each([
    ['sso_email_domain_not_allowed', 'Your email domain is not allowed to sign in. Use your organization account.'],
    ['sso_claim_not_allowed', 'Your account is not allowed to sign in to this deployment.'],
    [
      'sso_email_not_verified',
      'Your email address is not verified. Verify it with your identity provider, then try again.',
    ],
    ['account not linked', 'An account with your email address already exists. Contact your administrator.'],
    [
      'sso_external_id_missing',
      'Your identity provider did not send an account identifier. Contact your administrator.',
    ],
    [
      'sso_protocol_not_supported',
      'Your identity provider uses a sign-in protocol this deployment does not support. Contact your administrator.',
    ],
    ['anything_else', 'Sign-in failed. Please try again or contact your administrator.'],
  ])('explains a rejected sign-in with code %s', async (code, message) => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(githubConfig));
    render(
      <TestProviders>
        <LoginForm signInError={code} />
      </TestProviders>,
    );

    expect(await screen.findByText('Sign-in rejected')).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
