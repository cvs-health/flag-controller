// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';

import { RestoreFeatureFlagModal } from '../RestoreFeatureFlagModal';
import { ActionStatus } from '../../../typings/common';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn((action) => [
    {
      status: ActionStatus.Success,
    },
    (formData: FormData) => action(formData),
  ]),
}));
vi.mock('react-dom', () => ({
  useFormStatus: vi.fn(() => ({
    pending: false,
  })),
}));

describe('RestoreFeatureFlagModal', () => {
  it('should handle success', async () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();

    render(
      <RestoreFeatureFlagModal
        applicationName="Application Name"
        featureFlagKey="feature-flag-key"
        featureFlagId="feature-flag-id"
        onSuccess={onSuccess}
      >
        {(onOpen) => (
          <button type="button" onClick={onOpen}>
            Open Modal
          </button>
        )}
      </RestoreFeatureFlagModal>,
    );

    act(() => vi.advanceTimersByTime(2500));
    expect(onSuccess).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('should handle toggling', async () => {
    const onSuccess = vi.fn();

    render(
      <RestoreFeatureFlagModal
        applicationName="Application Name"
        featureFlagId="feature-flag-id"
        featureFlagKey="feature-flag-key"
        onSuccess={onSuccess}
      >
        {(onOpen) => (
          <button type="button" onClick={onOpen}>
            Open Modal
          </button>
        )}
      </RestoreFeatureFlagModal>,
    );

    await userEvent.click(screen.getByText('Open Modal'));

    expect(
      await screen.findByText(
        "You are about to restore 'feature-flag-key'. Are you sure you would like to restore it?",
      ),
    ).toBeVisible();
  });
});
