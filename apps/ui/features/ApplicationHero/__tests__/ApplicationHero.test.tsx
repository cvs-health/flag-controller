// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ApplicationHero from '../ApplicationHero';
import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn((action, initialActionState) => [
    initialActionState,
    (formData: FormData) => action(initialActionState, formData),
  ]),
}));
vi.mock('react-dom', () => ({
  useFormStatus: vi.fn(() => ({
    pending: false,
  })),
}));

describe('ApplicationHero', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({ data: [], metadata: { totalRecords: 0 } }));
  });

  it('shows the create feature flag modal when the Flag menu item is clicked', async () => {
    render(
      <TestProviders>
        <ApplicationHero
          applicationId="application-id"
          applicationName="test-app"
          teamName="test-team"
          actionsEnabled
        />
      </TestProviders>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Create' }));
    await userEvent.click(screen.getByText('Flag'));

    expect(screen.getByText('Create Flag')).toBeInTheDocument();
  });

  it('shows the create segment modal when the Segment menu item is clicked', async () => {
    render(
      <TestProviders>
        <ApplicationHero
          applicationId="application-id"
          applicationName="test-app"
          teamName="test-team"
          actionsEnabled
        />
      </TestProviders>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Create' }));
    await userEvent.click(screen.getByText('Segment'));

    expect(screen.getByText('Create Segment')).toBeInTheDocument();
  });
});
