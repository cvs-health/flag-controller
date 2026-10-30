// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';

const segmentListItem = {
  applicationId: 'app-1',
  applicationName: 'test-app',
  createdAt: new Date('2023-10-01T00:00:00Z'),
  deletedAt: null,
  description: 'description',
  flagTargetCount: 0,
  id: '1',
  key: 'segmentKey',
  updatedAt: new Date('2023-10-01T00:00:00Z'),
};

const serializedSegmentListItem = {
  ...segmentListItem,
  createdAt: segmentListItem.createdAt.toISOString(),
  updatedAt: segmentListItem.updatedAt.toISOString(),
};

const listSegmentsResponse = {
  data: [segmentListItem],
  metadata: {
    page: 1,
    records: 1,
    rows: 10,
    totalPages: 1,
    totalRecords: 1,
    search: '',
    sort: 'updatedAt:desc' as const,
  },
};

describe('get/applications/:applicationId/segments', () => {
  it('requests the route successfully', async () => {
    vi.mocked(mockServices.segments.listSegments).mockResolvedValue(listSegmentsResponse);

    const app = build();

    const response = await app.inject({
      method: 'GET',
      url: '/applications/app-1/segments?page=1&rows=10',
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(mockServices.segments.listSegments).toHaveBeenCalledExactlyOnceWith({
      filters: {
        applicationIds: ['app-1'],
        search: undefined,
      },
      pagination: {
        page: 1,
        rows: 10,
      },
      sort: {
        direction: 'desc',
        field: 'updatedAt',
      },
      with: {
        flagTargetCount: true,
      },
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual({
      data: [serializedSegmentListItem],
      metadata: {
        page: 1,
        records: 1,
        rows: 10,
        search: '',
        sort: 'updatedAt:desc',
        totalPages: 1,
        totalRecords: 1,
      },
    });
  });

  it('requests the route with search successfully', async () => {
    const listSegmentsResponseWithSearch = {
      ...listSegmentsResponse,
      metadata: {
        ...listSegmentsResponse.metadata,
        search: 'search123',
      },
    };

    vi.mocked(mockServices.segments.listSegments).mockResolvedValue(listSegmentsResponseWithSearch);

    const app = build();

    const response = await app.inject({
      method: 'GET',
      url: '/applications/app-1/segments?search=search123&page=1&rows=10',
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(mockServices.segments.listSegments).toHaveBeenCalledExactlyOnceWith({
      filters: {
        applicationIds: ['app-1'],
        search: 'search123',
      },
      pagination: {
        page: 1,
        rows: 10,
      },
      sort: {
        direction: 'desc',
        field: 'updatedAt',
      },
      with: {
        flagTargetCount: true,
      },
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual({
      data: [serializedSegmentListItem],
      metadata: {
        page: 1,
        records: 1,
        rows: 10,
        search: 'search123',
        sort: 'updatedAt:desc',
        totalPages: 1,
        totalRecords: 1,
      },
    });
  });
});
