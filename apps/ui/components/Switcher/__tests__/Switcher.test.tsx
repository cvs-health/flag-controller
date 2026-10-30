// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Switcher } from '../Switcher';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/flags',
  useSearchParams: () => new URLSearchParams('foo=bar'),
}));

describe('Switcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pushes route with updated params when a different switch is selected', async () => {
    render(
      <Switcher
        parameter="environment"
        selected="development"
        switches={{ development: 'Development', production: 'Production' }}
      />,
    );

    await userEvent.click(screen.getByRole('tab', { name: 'Production' }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/flags?foo=bar&environment=production', { scroll: false });
    });
  });
});
