// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Header } from '../Header';

vi.mock('next/header', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers({ 'x-next-url-pathname': '/flags' }))),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/flags',
}));

describe('Header', () => {
  it('renders navigation items when session exists', async () => {
    render(<Header authenticated />);

    expect(await screen.findByLabelText('Navigation')).toBeInTheDocument();
  });

  it('does not render navigation items when session does not exist', async () => {
    render(<Header authenticated={false} />);

    await waitFor(() => {
      expect(screen.queryByLabelText('Navigation')).not.toBeInTheDocument();
    });
  });
});
