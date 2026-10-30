// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { ApplicationsTable } from '../ApplicationsTable';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/applications',
  useSearchParams: () => mocks.searchParams,
}));

describe('ApplicationsTable', () => {
  afterEach(() => {
    mocks.searchParams = new URLSearchParams();
  });

  it('should render entries', async () => {
    const application = {
      id: '1',
      name: 'Application Name',
      team: {
        id: '2',
        name: 'Team Name',
      },
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithData({ data: [application], metadata: { totalRecords: 1 } }),
    );
    render(
      <TestProviders>
        <ApplicationsTable />
      </TestProviders>,
    );

    expect(await screen.findByRole('link', { name: application.name })).toHaveAttribute(
      'href',
      `/applications/${application.name}`,
    );
    expect(await screen.findByRole('link', { name: application.team.name })).toHaveAttribute(
      'href',
      `/teams/${application.team.name}`,
    );
  });

  it('should show empty state when no applications exist when fetching the applications', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({ data: [], metadata: { totalRecords: 0 } }));
    render(
      <TestProviders>
        <ApplicationsTable />
      </TestProviders>,
    );

    expect(await screen.findByText('There are no applications assigned to you yet')).toBeInTheDocument();
  });

  it('should allow the user to use pagination', async () => {
    const application = {
      id: '1',
      name: 'applicationname',
      team: {
        id: '2',
        name: 'teamname',
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithData({ data: [application], metadata: { totalRecords: 20 } }),
    );
    render(
      <TestProviders>
        <ApplicationsTable />
      </TestProviders>,
    );

    await userEvent.click(screen.getByLabelText('Next page'));

    expect(mocks.replace).toHaveBeenCalledWith('/applications?page=2&rows=10', { scroll: false });
  });
});
