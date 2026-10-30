// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useActionState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ActionStatus } from '../../../typings/common';
import { RemoveMemberModal } from '../RemoveMemberModal';

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

const mockMember = {
  id: 'member-1',
  name: 'John Doe',
  email: 'johndoe@email.com',
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  member: mockMember,
  teamId: 'team-1',
};

describe('RemoveMemberModal', () => {
  it('renders the modal with member details', () => {
    render(<RemoveMemberModal {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /are you sure you want to remove this member/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('johndoe@email.com')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<RemoveMemberModal {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows the error the action returned', () => {
    vi.mocked(useActionState).mockReturnValueOnce([
      {
        status: ActionStatus.Error,
        form: { userId: 'member-1', teamId: 'team-1' },
        errors: {
          actionError: {
            title: 'Failed to remove team member',
            subtitle: 'That member was already removed.',
          },
        },
      },
      vi.fn(),
      false,
    ]);

    render(<RemoveMemberModal {...defaultProps} />);

    expect(screen.getByText('Failed to remove team member')).toBeInTheDocument();
    expect(screen.getByText('That member was already removed.')).toBeInTheDocument();
  });

  it('calls onSuccess when removing a member succeeds', () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    vi.mocked(useActionState).mockReturnValueOnce([
      { status: ActionStatus.Success, form: { userId: 'member-1', teamId: 'team-1' } },
      vi.fn(),
      false,
    ]);

    render(<RemoveMemberModal {...defaultProps} onSuccess={onSuccess} />);

    act(() => vi.advanceTimersByTime(1000));

    expect(onSuccess).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
