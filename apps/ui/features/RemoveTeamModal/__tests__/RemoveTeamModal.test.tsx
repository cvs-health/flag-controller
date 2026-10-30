// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RemoveTeamModal } from '../RemoveTeamModal';

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

describe('RemoveTeamModal', () => {
  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(
      <RemoveTeamModal open onClose={onClose} onSuccess={vi.fn()} team={{ id: 'team-1', name: 'Iguana Ecommerce' }} />,
    );

    await userEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
