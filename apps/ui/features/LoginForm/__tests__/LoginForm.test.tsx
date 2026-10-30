// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LoginForm } from '../LoginForm';
import TestProviders from '../../../test/TestProviders';
import { authClient } from '../../../lib/auth-client';

describe('LoginForm', () => {
  it('should handle login', async () => {
    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>,
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() =>
      expect(authClient.signIn.social).toHaveBeenCalledWith({
        provider: 'github',
        callbackURL: 'http://localhost:3000/flags',
      }),
    );
  });

  it('shows an error when login fails', async () => {
    vi.mocked(authClient.signIn.social).mockRejectedValueOnce(new Error('Authentication failed'));

    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>,
    );

    fireEvent.click(screen.getByText('Login'));

    expect(await screen.findByText('Error authenticating')).toBeInTheDocument();
    expect(screen.getByText('There was an error authenticating. Please try again.')).toBeInTheDocument();
  });
});
