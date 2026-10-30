// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ActionStatus } from '../../../typings/common';
import { RestoreFeatureFlagNotification } from '../RestoreFeatureFlagNotification';

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

describe('RestoreFeatureFlagNotification', () => {
  it('should handle success', () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    render(
      <RestoreFeatureFlagNotification
        applicationName="applicationName"
        featureFlagKey="feature-flag-key"
        featureFlagId="feature-flag-id"
        onSuccess={onSuccess}
      />,
    );

    act(() => vi.advanceTimersByTime(2500));
    expect(onSuccess).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
