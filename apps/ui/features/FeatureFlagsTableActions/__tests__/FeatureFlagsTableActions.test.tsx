// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import { ActionStatus } from '../../../typings/common';
import { FeatureFlagsTableActions } from '../FeatureFlagsTableActions';
import { getFeatureFlagsQueryKey } from '../../../api/queries/useGetFeatureFlagsQuery';

const mocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  status: 'idle',
}));

vi.mock('@tanstack/react-query', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-query')>()),
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
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

function renderActions() {
  return render(
    <TestProviders>
      <FeatureFlagsTableActions applicationId="application-id" featureFlagId="flag-id" featureFlagKey="flag-key" />
    </TestProviders>,
  );
}

describe('FeatureFlagsTableActions', () => {
  afterEach(() => {
    mocks.status = ActionStatus.Idle;
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should open the archive modal from the overflow menu', async () => {
    renderActions();
    const modal = document.getElementById('archiveFeatureFlag-flag-id');

    expect(modal).not.toHaveClass('is-visible');

    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await userEvent.click(screen.getByText('Archive flag'));

    expect(modal).toHaveClass('is-visible');
    expect(screen.getByText('"flag-key"')).toBeInTheDocument();
  });

  it('should refetch the flags table after a flag is archived', () => {
    vi.useFakeTimers();
    mocks.status = ActionStatus.Success;
    renderActions();

    act(() => vi.advanceTimersByTime(2500));

    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [getFeatureFlagsQueryKey],
    });
  });
});
