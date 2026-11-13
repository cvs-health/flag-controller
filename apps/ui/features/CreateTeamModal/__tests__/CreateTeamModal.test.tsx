// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import type { CreateTeamActionState } from '../../../actions/createTeam';
import { CreateTeamModal } from '../CreateTeamModal';
import { ActionStatus } from '../../../typings/common';

const mocks = vi.hoisted(() => ({
  actionState: { form: { teamName: 'test-team' }, status: 'idle' } as CreateTeamActionState,
}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn((action) => [mocks.actionState, (formData: FormData) => action({}, formData)]),
}));

describe('CreateTeamModal', () => {
  it('should handle close', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(<CreateTeamModal onClose={onClose} open onSuccess={onSuccess} />);

    await userEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should handle success', async () => {
    vi.useFakeTimers();
    mocks.actionState.status = ActionStatus.Success;
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(<CreateTeamModal onClose={onClose} open onSuccess={onSuccess} />);

    act(() => vi.advanceTimersByTime(2500));
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(mocks.actionState.form.teamName);
    vi.useRealTimers();
  });

  it('should show the team name already in use errors', () => {
    mocks.actionState = {
      form: { teamName: 'test-team' },
      status: ActionStatus.Error,
      errors: {
        fieldErrors: { teamName: ['Please choose a unique team name.'] },
        actionError: { title: 'Failed to create team', subtitle: 'Team name already in use.' },
      },
    };

    render(<CreateTeamModal onClose={vi.fn()} open onSuccess={vi.fn()} />);

    expect(screen.getByText('Failed to create team')).toBeInTheDocument();
    expect(screen.getByText('Team name already in use.')).toBeInTheDocument();
    expect(screen.getByText('Please choose a unique team name.')).toBeInTheDocument();
    expect(screen.getByLabelText('Team name')).toBeInvalid();
  });
});
