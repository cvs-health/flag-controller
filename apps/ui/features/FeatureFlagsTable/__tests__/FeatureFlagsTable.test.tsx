// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureFlagType } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { FeatureFlagsTable } from '../FeatureFlagsTable';
import { getFeatureFlagsUrl } from '../../../api/requests/getFeatureFlags';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/flags',
  useSearchParams: () => mocks.searchParams,
}));

describe('FeatureFlagsTable', () => {
  const featureFlag = {
    applicationName: 'applicationName',
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
    applicationName: 'anotherApplicationName',
    key: 'my-other-cool-flag',
    enabled: false,
  };

  it('should render flags', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithData({ data: [featureFlag, featureFlagDisabled], metadata: { totalRecords: 2 } }),
    );
    render(
      <TestProviders>
        <FeatureFlagsTable />
      </TestProviders>,
    );

    expect(await screen.findByText(featureFlag.applicationName)).toBeInTheDocument();
    expect(screen.getByText(featureFlag.key)).toBeInTheDocument();
    expect(screen.getByText(featureFlagDisabled.key)).toBeInTheDocument();
  });

  it('should allow the user to search for a feature flag', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithData({ data: [featureFlag], metadata: { totalRecords: 1 } }),
    );
    render(
      <TestProviders>
        <FeatureFlagsTable />
      </TestProviders>,
    );

    await userEvent.type(screen.getByLabelText('search'), featureFlagDisabled.key);

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith(`/flags?search=${featureFlagDisabled.key}&page=1`, { scroll: false });
    });
  });

  it('should allow the user to use pagination', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithData({ data: [featureFlag], metadata: { totalRecords: 20 } }),
    );
    render(
      <TestProviders>
        <FeatureFlagsTable />
      </TestProviders>,
    );

    await userEvent.click(screen.getByLabelText('Next page'));

    expect(mocks.replace).toHaveBeenCalledWith('/flags?page=2&rows=10', { scroll: false });
  });

  it('should allow the user to sort columns', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithData({ data: [featureFlag], metadata: { totalRecords: 1 } }),
    );

    render(
      <TestProviders>
        <FeatureFlagsTable />
      </TestProviders>,
    );

    expect(await screen.findByText(featureFlag.key)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getFeatureFlagsUrl({ page: 1, rows: 10 }, '', true, 'key:asc')}`,
      expect.any(Object),
    );

    await userEvent.click(screen.getByText('Created'));

    expect(mocks.replace).toHaveBeenCalledWith('/flags?sort=createdAt%3Aasc', { scroll: false });
  });

  it('should allow the user to set filters', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithData({ data: [featureFlag], metadata: { totalRecords: 1 } }),
    );

    render(
      <TestProviders>
        <FeatureFlagsTable />
      </TestProviders>,
    );

    expect(await screen.findByText(featureFlag.key)).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Filtering'));
    await userEvent.click(await screen.findByText('Object'));
    await userEvent.click(screen.getByText('Apply filters'));

    expect(mocks.replace).toHaveBeenCalledWith('/flags?filters=featureFlagTypes%3Dobject&page=1', { scroll: false });
  });

  it('should allow the user to sort a column the other direction when already selected', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithData({ data: [featureFlag], metadata: { totalRecords: 1 } }),
    );

    render(
      <TestProviders>
        <FeatureFlagsTable />
      </TestProviders>,
    );

    expect(await screen.findByText(featureFlag.key)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getFeatureFlagsUrl({ page: 1, rows: 10 }, '', true, 'key:asc')}`,
      expect.any(Object),
    );

    await userEvent.click(screen.getByText('Flag'));

    expect(mocks.replace).toHaveBeenCalledWith('/flags?sort=key%3Adesc', { scroll: false });
  });

  it('should show empty state when no flags exist when fetching the flags', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({ data: [], metadata: { totalRecords: 0 } }));
    render(
      <TestProviders>
        <FeatureFlagsTable />
      </TestProviders>,
    );

    expect(await screen.findByText('Start by adding a flag')).toBeInTheDocument();
  });

  it('should show empty state when no search results exist when fetching the flags', async () => {
    mocks.searchParams.set('search', 'test');
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({ data: [], metadata: { totalRecords: 0 } }));

    render(
      <TestProviders>
        <FeatureFlagsTable />
      </TestProviders>,
    );

    expect(await screen.findByText('No results found')).toBeInTheDocument();
  });
});
