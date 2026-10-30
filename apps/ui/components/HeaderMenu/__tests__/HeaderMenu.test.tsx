// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { authClient } from '../../../lib/auth-client';
import { HeaderMenu } from '../HeaderMenu';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('HeaderMenu', () => {
  it('handles menu items', async () => {
    const open = vi.spyOn(window, 'open');

    render(<HeaderMenu />);

    await userEvent.click(screen.getByLabelText('Header menu'));
    await userEvent.click(screen.getByText('Support channel'));

    await waitFor(() => {
      expect(open).toHaveBeenCalledExactlyOnceWith('login.supportUrl', '_blank');
    });

    await userEvent.click(screen.getByText('ui.documentationLabel'));

    await waitFor(() => {
      expect(open).toHaveBeenCalledTimes(2);
      expect(open).toHaveBeenCalledWith('ui.documentationUrl', '_blank');
    });

    await userEvent.click(screen.getByText('Log out'));

    await waitFor(() => {
      expect(authClient.signOut).toHaveBeenCalledOnce();
    });
  });
});
