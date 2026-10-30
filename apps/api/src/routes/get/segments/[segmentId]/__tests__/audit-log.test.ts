// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { ColumnSortingDirection } from '../../../../../types/common.js';
import { PAGINATION_NO_LIMIT } from '../../../../../constants/pagination.js';
import { mockServices } from 'test/testUtils.js';

describe('get/segments/:segmentId/audit-log', () => {
  it('requests the route successfully', async () => {
    const app = build();

    vi.mocked(mockServices.segments.getSegmentById).mockResolvedValue({
      applicationId: 'application-id',
      applicationName: 'application-name',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      deletedAt: null,
      description: 'segment-description',
      id: 'segment-id',
      key: 'segment-key',
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    });
    vi.mocked(mockServices.rules.listRules).mockResolvedValue({
      data: [
        {
          conditions: [],
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          deletedAt: null,
          environmentId: 'environment-id',
          flagId: null,
          flagKey: null,
          id: 'rule-id',
          key: 'rule-key',
          orderPosition: 1,
          segmentId: 'segment-id',
          segmentKey: 'segment-key',
          serveFractional: null,
          serveFractionalId: null,
          serveVariationId: null,
          serveVariationKey: null,
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        },
      ],
      metadata: {
        page: 1,
        records: 0,
        rows: 0,
        totalPages: 1,
        totalRecords: 0,
      },
    });
    vi.mocked(mockServices.logs.listLogs).mockResolvedValue({
      data: [],
      metadata: {
        page: 1,
        records: 0,
        rows: 1,
        search: '',
        sort: 'createdAt:desc',
        totalPages: 0,
        totalRecords: 0,
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/segments/segmentId/audit-log?page=1&rows=10',
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(app.services.segmentsService.getSegmentById).toHaveBeenCalledExactlyOnceWith('segmentId');
    expect(app.services.rulesService.listRules).toHaveBeenCalledExactlyOnceWith({
      filters: {
        segmentIds: ['segment-id'],
      },
      pagination: {
        page: 1,
        rows: PAGINATION_NO_LIMIT,
      },
      sort: {
        direction: ColumnSortingDirection.ASC,
        field: 'key',
      },
    });
    expect(app.services.logsService.listLogs).toHaveBeenCalledExactlyOnceWith({
      filters: {
        and: {
          applicationIds: ['application-id'],
          subjectIds: ['segment-id', 'rule-id'],
        },
      },
      pagination: {
        page: 1,
        rows: 10,
      },
      sort: {
        direction: ColumnSortingDirection.DESC,
        field: 'createdAt',
      },
    });
    expect(response.statusCode).toEqual(200);
  });
});
