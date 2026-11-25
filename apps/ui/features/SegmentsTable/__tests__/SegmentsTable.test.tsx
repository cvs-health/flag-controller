// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { Scope } from 'shared-types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { getSegmentsUrl } from '../../../api/requests/getSegments';
import { SegmentsTable } from '../SegmentsTable';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/segments',
  useSearchParams: () => mocks.searchParams,
}));

describe('SegmentsTable', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mocks.searchParams = new URLSearchParams();
  });

  const segment = {
    applicationName: 'Application Name',
    createdAt: '2023-10-01T00:00:00Z',
    description: 'Segment Description',
    environmentKey: 'production',
    flagsTargetedCount: 1,
    id: 1,
    key: 'segment-key',
    updatedAt: '2023-10-01T00:00:00Z',
  };
  const segment2 = {
    ...segment,
    key: 'segment-key-2',
    applicationName: 'Application Name 2',
  };

  it('should render segments', async () => {
    const responsePayload = {
      data: [segment],
      metadata: {
        page: 1,
        records: 1,
        rows: 10,
        search: '',
        sort: 'updatedAt:desc',
        totalPages: 1,
        totalRecords: 1,
      },
    };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(responsePayload));

    render(
      <TestProviders>
        <SegmentsTable />
      </TestProviders>,
    );

    expect(await screen.findByRole('link', { name: segment.applicationName })).toHaveAttribute(
      'href',
      `/applications/${segment.applicationName}`,
    );
    expect(await screen.findByRole('link', { name: segment.key })).toHaveAttribute(
      'href',
      `/applications/${segment.applicationName}/segments/${segment.key}`,
    );
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getSegmentsUrl({ page: 1, rows: 10 }, '', 'updatedAt:desc', Scope.Me)}`,
      expect.any(Object),
    );
  });

  it('should pass the selected scope to the segments query', async () => {
    const responsePayload = {
      data: [segment],
      metadata: {
        page: 1,
        records: 1,
        rows: 10,
        search: '',
        sort: 'updatedAt:desc',
        totalPages: 1,
        totalRecords: 1,
      },
    };
    mocks.searchParams = new URLSearchParams({ scope: Scope.All });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(responsePayload));

    render(
      <TestProviders>
        <SegmentsTable />
      </TestProviders>,
    );

    expect(await screen.findByRole('link', { name: segment.key })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getSegmentsUrl({ page: 1, rows: 10 }, '', 'updatedAt:desc', Scope.All)}`,
      expect.any(Object),
    );
  });

  it('should allow the user to search for a feature flag', async () => {
    const responsePayload = {
      data: [segment],
      metadata: {
        page: 1,
        records: 1,
        rows: 10,
        search: '',
        sort: 'updatedAt:desc',
        totalPages: 1,
        totalRecords: 1,
      },
    };
    const responsePayload2 = {
      ...responsePayload,
      data: [segment2],
    };
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(resolvePromiseWithData(responsePayload))
      .mockResolvedValueOnce(resolvePromiseWithData(responsePayload2));

    render(
      <TestProviders>
        <SegmentsTable />
      </TestProviders>,
    );

    await userEvent.type(screen.getByLabelText('search'), segment2.key);

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith(`/segments?search=${segment2.key}&page=1`, { scroll: false });
    });
  });

  it('should show empty state when no segments exist when fetching the segments', async () => {
    const responsePayload = {
      data: [],
      metadata: {
        page: 1,
        records: 0,
        rows: 10,
        search: '',
        sort: 'updatedAt:desc',
        totalPages: 0,
        totalRecords: 0,
      },
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(responsePayload));

    render(
      <TestProviders>
        <SegmentsTable />
      </TestProviders>,
    );

    expect(await screen.findByText('Start by adding a segment')).toBeInTheDocument();
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
        <SegmentsTable />
      </TestProviders>,
    );

    await userEvent.click(screen.getByLabelText('Next page'));

    expect(mocks.replace).toHaveBeenCalledWith('/segments?page=2&rows=10', { scroll: false });
  });

  it('should offer to search all segments when no results exist in my segments', async () => {
    const responsePayload = {
      data: [],
      metadata: {
        page: 1,
        records: 0,
        rows: 10,
        search: '',
        sort: 'updatedAt:desc',
        totalPages: 0,
        totalRecords: 0,
      },
    };
    mocks.searchParams = new URLSearchParams({ search: 'test', scope: Scope.Me });
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(responsePayload));

    render(
      <TestProviders>
        <SegmentsTable />
      </TestProviders>,
    );

    expect(await screen.findByText('No segments found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All segments' })).toHaveAttribute(
      'href',
      `/segments?search=test&scope=${Scope.All}`,
    );
    expect(screen.queryByText('Start by adding a segment')).not.toBeInTheDocument();
  });

  it('should show search guidance when no results exist in all segments', async () => {
    mocks.searchParams = new URLSearchParams({ search: 'test', scope: Scope.All });
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithData({
        data: [],
        metadata: {
          page: 1,
          records: 0,
          rows: 10,
          search: 'test',
          sort: 'updatedAt:desc',
          totalPages: 0,
          totalRecords: 0,
        },
      }),
    );

    render(
      <TestProviders>
        <SegmentsTable />
      </TestProviders>,
    );

    expect(await screen.findByText('No segments found')).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your search to find what you're looking for.")).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'All segments' })).not.toBeInTheDocument();
    expect(screen.queryByText('Start by adding a segment')).not.toBeInTheDocument();
  });
});
