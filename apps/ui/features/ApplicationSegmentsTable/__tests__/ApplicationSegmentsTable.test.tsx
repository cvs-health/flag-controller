// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { ApplicationSegmentsTable } from '../ApplicationSegmentsTable';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/application/applicationName/segments',
  useSearchParams: () => mocks.searchParams,
}));

describe('ApplicationSegmentsTable', () => {
  afterEach(() => {
    mocks.searchParams = new URLSearchParams();
  });

  const segment = {
    applicationId: 'application-id',
    applicationName: 'application-name',
    createdAt: '2025-04-11T12:00:00Z',
    description: 'description',
    environmentKey: 'development',
    flagsTargetedCount: 0,
    id: 1,
    key: 'segmentKey',
    rules: [],
    updatedAt: '2025-04-11T14:00:00Z',
  };

  it('should render segments', async () => {
    const responsePayload = {
      data: [segment],
      metadata: {
        totalRecords: 1,
      },
    };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(responsePayload));
    render(
      <TestProviders>
        <ApplicationSegmentsTable applicationId={segment.applicationId} />
      </TestProviders>,
    );

    expect(await screen.findByRole('link', { name: segment.key })).toHaveAttribute(
      'href',
      `/applications/${segment.applicationName}/segments/${segment.key}`,
    );
  });

  it('should allow the user to use pagination', async () => {
    const responsePayload = {
      data: [segment],
      metadata: {
        page: 1,
        records: 1,
        rows: 10,
        search: '',
        sort: 'updatedAt:desc',
        totalPages: 1,
        totalRecords: 20,
      },
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(responsePayload));

    render(
      <TestProviders>
        <ApplicationSegmentsTable applicationId={segment.applicationId} />
      </TestProviders>,
    );

    await userEvent.click(screen.getByLabelText('Next page'));

    expect(mocks.replace).toHaveBeenCalledWith('/application/applicationName/segments?page=2&rows=10', {
      scroll: false,
    });
  });

  it('should show empty state when no segments exist when fetching the segments', async () => {
    const responsePayload = {
      data: [],
      metadata: {
        totalRecords: 0,
      },
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(responsePayload));
    render(
      <TestProviders>
        <ApplicationSegmentsTable applicationId={segment.applicationId} />
      </TestProviders>,
    );

    expect(await screen.findByText('Start by adding a segment')).toBeInTheDocument();
  });

  it('should show empty state when no search results exist when fetching the segments', async () => {
    const responsePayload = {
      data: [],
      metadata: {
        totalRecords: 0,
      },
    };
    mocks.searchParams.set('search', 'test');
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(responsePayload));
    render(
      <TestProviders>
        <ApplicationSegmentsTable applicationId={segment.applicationId} />
      </TestProviders>,
    );

    expect(await screen.findByText('No results found')).toBeInTheDocument();
  });
});
