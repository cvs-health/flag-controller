// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';

import { ActionStatus } from '../../../typings/common';
import { CreateApplicationModal } from '../CreateApplicationModal';
import TestQueryClientProvider from '../../../test/TestQueryClientProvider';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';

const mocks = vi.hoisted(() => ({
  actionState: { form: { applicationName: 'my-app-name', teamId: 'team-1' }, status: 'idle' },
}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn((action) => [mocks.actionState, (formData: FormData) => action({}, formData)]),
}));

describe('CreateApplicationModal', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({ data: [], metadata: { totalRecords: 0 } }));
  });

  it('should handle close', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(<CreateApplicationModal onClose={onClose} open onSuccess={onSuccess} />, {
      wrapper: TestQueryClientProvider,
    });

    await userEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should handle success', async () => {
    vi.useFakeTimers();
    mocks.actionState.status = ActionStatus.Success;
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(<CreateApplicationModal onClose={onClose} open onSuccess={onSuccess} />, {
      wrapper: TestQueryClientProvider,
    });

    act(() => vi.advanceTimersByTime(2500));
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(mocks.actionState.form.applicationName);
    vi.useRealTimers();
  });
});
