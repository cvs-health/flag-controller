// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ActionStatus } from '../../../typings/common';
import { RemoveApplicationModal } from '../RemoveApplicationModal';

const mocks = vi.hoisted(() => ({
  status: 'idle' as ActionStatus,
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn((action, initialActionState) => [
    { ...initialActionState, status: mocks.status },
    (formData: FormData) => action({}, formData),
  ]),
}));

describe('RemoveApplicationModal', () => {
  afterEach(() => {
    mocks.status = ActionStatus.Idle;
    vi.useRealTimers();
  });

  it('should handle close', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <RemoveApplicationModal
        onClose={onClose}
        onSuccess={onSuccess}
        open
        applicationId="123"
        applicationName="my-app-name"
      />,
    );

    await userEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should handle success', async () => {
    mocks.status = ActionStatus.Success;
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <RemoveApplicationModal
        onClose={onClose}
        onSuccess={onSuccess}
        open
        applicationId="123"
        applicationName="my-app-name"
      />,
    );

    // SubmitButton calls `onSubmitDone` 2500ms after status becomes Success, so onSuccess should not have fired yet.
    expect(onSuccess).not.toHaveBeenCalled();

    // Advance the 2500ms delay to trigger onSuccess.
    await vi.advanceTimersByTimeAsync(2600);

    expect(onSuccess).toHaveBeenCalled();
  });
});
