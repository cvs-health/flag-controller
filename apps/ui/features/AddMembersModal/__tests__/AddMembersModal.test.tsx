// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useActionState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import TestQueryClientProvider from '../../../test/TestQueryClientProvider';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { AddMembersModal } from '../AddMembersModal';
import { ActionStatus } from '../../../typings/common';

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

describe('AddMembersModal', () => {
  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(
      <TestQueryClientProvider>
        <AddMembersModal open onClose={onClose} onSuccess={vi.fn()} teamId="team-1" />
      </TestQueryClientProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders message when no users exist', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([]));
    render(
      <TestQueryClientProvider>
        <AddMembersModal open onClose={vi.fn()} onSuccess={vi.fn()} teamId="team-1" />
      </TestQueryClientProvider>,
    );

    expect(screen.getByRole('combobox', { name: /select members from the list/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add members/i })).toBeDisabled();
    expect(await screen.findByText('There are no users available.')).toBeInTheDocument();
  });

  it('renders an error notification when users fetch fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    render(
      <TestQueryClientProvider>
        <AddMembersModal open onClose={vi.fn()} onSuccess={vi.fn()} teamId="team-1" />
      </TestQueryClientProvider>,
    );

    expect(await screen.findByText('System error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load users. Please try again later.')).toBeInTheDocument();
  });

  it('shows the error the action returned', async () => {
    vi.mocked(useActionState).mockReturnValueOnce([
      {
        status: ActionStatus.Error,
        form: { memberIds: [] },
        errors: {
          actionError: {
            title: 'Failed to add team members',
            subtitle: 'One of those users is already on the team.',
          },
        },
      },
      vi.fn(),
      false,
    ]);
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([{ id: 'user-1', name: 'John Doe' }]));

    render(
      <TestQueryClientProvider>
        <AddMembersModal open onClose={vi.fn()} onSuccess={vi.fn()} teamId="team-1" />
      </TestQueryClientProvider>,
    );

    expect(await screen.findByText('Failed to add team members')).toBeInTheDocument();
    expect(screen.getByText('One of those users is already on the team.')).toBeInTheDocument();
  });

  it('leaves a member field error to the field rather than the banner', async () => {
    vi.mocked(useActionState).mockReturnValueOnce([
      {
        status: ActionStatus.Error,
        form: { memberIds: [] },
        errors: {
          fieldErrors: { memberIds: ['You must select at least one member.'] },
          actionError: { title: 'Failed to add team members', subtitle: 'Some of the information is not valid.' },
        },
      },
      vi.fn(),
      false,
    ]);
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([{ id: 'user-1', name: 'John Doe' }]));

    render(
      <TestQueryClientProvider>
        <AddMembersModal open onClose={vi.fn()} onSuccess={vi.fn()} teamId="team-1" />
      </TestQueryClientProvider>,
    );

    expect(await screen.findByRole('combobox', { name: /select members from the list/i })).toBeInTheDocument();
    expect(screen.queryByText('Failed to add team members')).not.toBeInTheDocument();
    expect(screen.queryByText('Some of the information is not valid.')).not.toBeInTheDocument();
  });

  it('calls onSuccess when adding members succeeds', () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([]));
    vi.mocked(useActionState).mockReturnValueOnce([
      { status: ActionStatus.Success, form: { memberIds: ['member-1'], teamId: 'team-1' } },
      vi.fn(),
      false,
    ]);

    render(
      <TestQueryClientProvider>
        <AddMembersModal open onClose={vi.fn()} onSuccess={onSuccess} teamId="team-1" />
      </TestQueryClientProvider>,
    );

    act(() => vi.advanceTimersByTime(1000));

    expect(onSuccess).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
