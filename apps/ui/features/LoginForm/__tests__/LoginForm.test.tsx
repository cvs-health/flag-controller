// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PublicConfig } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import { LoginForm } from '../LoginForm';
import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { authClient } from '../../../lib/auth-client';

const githubConfig = {
  authProviders: [{ id: 'github', label: 'GitHub', kind: 'social' }],
  features: {},
  modes: {},
} satisfies PublicConfig;

function renderLoginForm() {
  render(
    <TestProviders>
      <LoginForm />
    </TestProviders>,
  );
}

describe('LoginForm', () => {
  it('signs in with the provider the API reports', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(githubConfig));
    renderLoginForm();

    fireEvent.click(await screen.findByRole('button', { name: 'Login with GitHub' }));

    await waitFor(() =>
      expect(authClient.signIn.social).toHaveBeenCalledWith({
        provider: 'github',
        callbackURL: 'http://localhost:3000/flags',
      }),
    );
  });

  it('does not assume GitHub when the API reports another provider', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithData({
        ...githubConfig,
        authProviders: [{ id: 'gitlab', label: 'GitLab', kind: 'social' }],
      }),
    );
    renderLoginForm();

    fireEvent.click(await screen.findByRole('button', { name: 'Login with GitLab' }));

    await waitFor(() =>
      expect(authClient.signIn.social).toHaveBeenCalledWith({
        provider: 'gitlab',
        callbackURL: 'http://localhost:3000/flags',
      }),
    );
  });

  it('keeps the button disabled until the API has answered', () => {
    vi.spyOn(global, 'fetch').mockReturnValueOnce(new Promise(() => {}));
    renderLoginForm();

    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  it('shows an error when login fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(githubConfig));
    vi.mocked(authClient.signIn.social).mockRejectedValueOnce(new Error('Authentication failed'));
    renderLoginForm();

    fireEvent.click(await screen.findByRole('button', { name: 'Login with GitHub' }));

    expect(await screen.findByText('There was an error authenticating. Please try again.')).toBeInTheDocument();
  });

  it('shows an error instead of an empty page when the API cannot be reached', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new TypeError('fetch failed'));
    renderLoginForm();

    expect(
      await screen.findByText('Sign-in options could not be loaded. Please refresh the page.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
  });
});
