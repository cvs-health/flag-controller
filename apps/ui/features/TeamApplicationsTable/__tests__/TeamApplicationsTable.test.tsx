// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { TeamApplicationsTable } from '../TeamApplicationsTable';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/team/teamName',
  useSearchParams: () => mocks.searchParams,
}));

describe('TeamApplicationsTable', () => {
  it('should show empty state when no applications exist when fetching the applications', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({ data: [], metadata: { totalRecords: 0 } }));
    render(
      <TestProviders>
        <TeamApplicationsTable teamId="teamId" />
      </TestProviders>,
    );

    expect(await screen.findByText('There are no applications assigned to this team yet')).toBeInTheDocument();
  });

  it('should show empty state when no search results exist when fetching the applications', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({ data: [], metadata: { totalRecords: 0 } }));
    render(
      <TestProviders>
        <TeamApplicationsTable teamId="teamId" />
      </TestProviders>,
    );

    await userEvent.type(screen.getByLabelText('search'), 'test');

    expect(await screen.findByText('No results found')).toBeInTheDocument();
  });

  it('should handle pagination', async () => {
    const applications = Array.from({ length: 15 }, () => ({
      name: faker.company.name(),
    }));
    mocks.searchParams.set('page', '1');
    mocks.searchParams.set('rows', '10');
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithData({ data: applications, metadata: { totalRecords: 15 } }),
    );
    render(
      <TestProviders>
        <TeamApplicationsTable teamId="teamId" />
      </TestProviders>,
    );

    expect(await screen.findByText('1–10 of 15 items')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Next page'));

    expect(await screen.findByText('11–15 of 15 items')).toBeInTheDocument();
  });
});
