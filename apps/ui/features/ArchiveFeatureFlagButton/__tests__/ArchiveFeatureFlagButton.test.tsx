// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';

import { ArchiveFeatureFlagButton } from '../ArchiveFeatureFlagButton';
import { ActionStatus } from '../../../typings/common';

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mocks.refresh,
  }),
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn((action) => [
    {
      status: ActionStatus.Success,
    },
    (formData: FormData) => action(formData),
  ]),
}));

describe('ArchiveFeatureFlagButton', () => {
  it('should call router.refresh on successful archive', () => {
    vi.useFakeTimers();
    render(
      <ArchiveFeatureFlagButton
        applicationId="application-id"
        featureFlagKey="feature-flag-key"
        featureFlagId="feature-flag-id"
      />,
    );

    act(() => vi.advanceTimersByTime(2500));
    expect(mocks.refresh).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
