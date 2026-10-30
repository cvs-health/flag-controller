// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TeamHero } from '../TeamHero';
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
  useFormStatus: vi.fn(() => ({ pending: false })),
}));

describe('TeamHero', () => {
  it('opens remove team modal', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithData({
        data: [
          {
            id: 'team-1',
            name: 'Iguana Ecommerce',
          },
        ],
        metadata: { totalRecords: 1 },
      }),
    );

    render(
      <TestProviders>
        <TeamHero teamName="Iguana Ecommerce" />
      </TestProviders>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Actions' }));
    await userEvent.click(screen.getByText('Remove team'));

    expect(
      screen.getByText(
        'You can only remove a team if it has no applications. Remove applications on the Applications page.',
      ),
    ).toBeInTheDocument();
  });
});
