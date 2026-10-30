// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureFlagType } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { ApplicationFeatureFlagsTable } from '../ApplicationFeatureFlagsTable';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/applications/applicationName',
  useSearchParams: () => mocks.searchParams,
}));

describe('ApplicationFeatureFlagsTable', () => {
  const featureFlag = {
    applicationId: 'application-id',
    createdAt: '2023-10-01T12:00:00Z',
    enabled: true,
    environmentKey: 'development',
    id: 1,
    key: 'my-cool-flag',
    updatedAt: '2023-10-02T12:00:00Z',
    type: FeatureFlagType.Boolean,
  };
  const featureFlagDisabled = {
    ...featureFlag,
    id: 2,
    applicationId: 'another-application-id',
    key: 'my-other-cool-flag',
    enabled: false,
  };

  it('should render flags', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithData({ data: [featureFlag, featureFlagDisabled], metadata: {} }),
    );
    render(
      <TestProviders>
        <ApplicationFeatureFlagsTable applicationId={featureFlag.applicationId} />
      </TestProviders>,
    );

    expect(await screen.findByText(featureFlag.key)).toBeInTheDocument();
    expect(screen.getByText(featureFlagDisabled.key)).toBeInTheDocument();
  });

  it('should allow the user to search for a feature flag', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData({ data: [featureFlag], metadata: {} }));
    render(
      <TestProviders>
        <ApplicationFeatureFlagsTable applicationId={featureFlag.applicationId} />
      </TestProviders>,
    );

    await userEvent.type(screen.getByLabelText('search'), featureFlagDisabled.key);

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith(
        `/applications/applicationName?search=${featureFlagDisabled.key}&page=1`,
        { scroll: false },
      );
    });
  });

  it('should show empty state when no flags exist when fetching the flags, with permission to act on the application', async () => {
    mocks.searchParams.set('search', '');
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({ data: [], metadata: {} }));
    render(
      <TestProviders>
        <ApplicationFeatureFlagsTable applicationId={featureFlag.applicationId} />
      </TestProviders>,
    );

    expect(await screen.findByText('Start by adding a flag')).toBeInTheDocument();
  });

  it('should show empty state when no search results exist when fetching the flags', async () => {
    mocks.searchParams.set('search', 'test');
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({ data: [], metadata: {} }));
    render(
      <TestProviders>
        <ApplicationFeatureFlagsTable applicationId={featureFlag.applicationId} />
      </TestProviders>,
    );

    expect(await screen.findByText('No results found')).toBeInTheDocument();
  });
});
