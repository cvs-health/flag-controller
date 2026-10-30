// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import { ArchiveFeatureFlagModal } from '../ArchiveFeatureFlagModal';
import { ActionStatus } from '../../../typings/common';
import TestProviders from '../../../test/TestProviders';

const mocks = vi.hoisted(() => ({
  status: 'idle',
}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn((action) => [
    {
      status: mocks.status,
    },
    (formData: FormData) => action(formData),
  ]),
}));
vi.mock('react-dom', () => ({
  useFormStatus: vi.fn(() => ({
    pending: false,
  })),
}));

describe('ArchiveFeatureFlagModal', () => {
  afterEach(() => vi.useRealTimers());

  it('should handle success', async () => {
    vi.useFakeTimers();
    mocks.status = ActionStatus.Success;
    const onSuccess = vi.fn();

    render(
      <TestProviders>
        <ArchiveFeatureFlagModal
          applicationId="application-id"
          featureFlagId="feature-flag-id"
          featureFlagKey="feature-flag-key"
          onSuccess={onSuccess}
        >
          {(onOpen) => (
            <button type="button" onClick={onOpen}>
              Open Modal
            </button>
          )}
        </ArchiveFeatureFlagModal>
      </TestProviders>,
    );

    act(() => vi.advanceTimersByTime(2500));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('should handle toggling', async () => {
    const onSuccess = vi.fn();

    render(
      <TestProviders>
        <ArchiveFeatureFlagModal
          applicationId="application-id"
          featureFlagId="feature-flag-id"
          featureFlagKey="feature-flag-key"
          onSuccess={onSuccess}
        >
          {(onOpen) => (
            <button type="button" onClick={onOpen}>
              Open Modal
            </button>
          )}
        </ArchiveFeatureFlagModal>
      </TestProviders>,
    );

    await userEvent.click(screen.getByText('Open Modal'));

    expect(await screen.findByText('"feature-flag-key"')).toBeVisible();
    expect(
      screen.getByText(
        'Turn off this flag in all environments (Development and Production), regardless of current state',
      ),
    ).toBeVisible();
    expect(screen.getByText('Archive and turn off')).toBeVisible();
  });
});
