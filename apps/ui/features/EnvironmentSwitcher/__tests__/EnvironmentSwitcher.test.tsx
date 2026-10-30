// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EnvironmentKey } from 'shared-types';

import { EnvironmentSwitcher } from '../EnvironmentSwitcher';
import TestProviders from '../../../test/TestProviders';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => '/rules/test-app',
  useSearchParams: () => new URLSearchParams('rulesEnvironment=production'),
}));

describe('EnvironmentSwitcher', () => {
  it('should update search params when environment changes', async () => {
    const mockEnvironments = [
      { id: 'env-1', key: EnvironmentKey.Production },
      { id: 'env-2', key: EnvironmentKey.Development },
    ];

    render(
      <TestProviders>
        <EnvironmentSwitcher environments={mockEnvironments} environmentId="env-2" />
      </TestProviders>,
    );

    await userEvent.click(screen.getByText('Production'));

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining('rulesEnvironment=production'), {
        scroll: false,
      });
    });
  });
});
