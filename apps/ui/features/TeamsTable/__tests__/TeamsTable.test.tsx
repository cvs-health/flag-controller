// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TestQueryClientProvider from '../../../test/TestQueryClientProvider';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { TeamsTable } from '../TeamsTable';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/teams',
  useSearchParams: () => mocks.searchParams,
}));

describe('TeamsTable', () => {
  afterEach(() => {
    mocks.searchParams = new URLSearchParams();
  });

  it('should render entries', async () => {
    const application = {
      id: '2',
      name: 'applicationname',
    };
    const team = {
      id: '1',
      name: 'teamname',
      applications: [application],
    };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithData({ data: [team], metadata: { totalRecords: 1 } }),
    );
    render(
      <TestQueryClientProvider>
        <TeamsTable />
      </TestQueryClientProvider>,
    );

    expect(await screen.findByRole('link', { name: application.name })).toHaveAttribute(
      'href',
      `/applications/${application.name}`,
    );
    expect(await screen.findByRole('link', { name: team.name })).toHaveAttribute('href', `/teams/${team.name}`);
  });

  it('should show empty state when no teams exist when fetching the teams', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({ data: [], metadata: { totalRecords: 0 } }));
    render(
      <TestQueryClientProvider>
        <TeamsTable />
      </TestQueryClientProvider>,
    );

    expect(await screen.findByText('There are no teams assigned to you yet')).toBeInTheDocument();
  });
});
