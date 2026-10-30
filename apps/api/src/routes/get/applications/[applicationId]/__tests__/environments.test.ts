// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';
import { ColumnSortingDirection } from '../../../../../types/common.js';
import { PAGINATION_NO_LIMIT } from '../../../../../constants/pagination.js';

describe('get/applications/:applicationId/environments', () => {
  it('should successfully resolve', async () => {
    vi.mocked(mockServices.environments.listEnvironments).mockResolvedValue({
      data: [],
      metadata: {
        page: 1,
        records: 0,
        rows: PAGINATION_NO_LIMIT,
        totalPages: 0,
        totalRecords: 0,
      },
    });

    const app = build();

    const response = await app.inject({
      method: 'GET',
      url: '/applications/app-1/environments',
    });

    await app.close();

    expect(app.services.environmentsService.listEnvironments).toHaveBeenCalledExactlyOnceWith({
      filters: { applicationId: 'app-1' },
      pagination: { page: 1, rows: PAGINATION_NO_LIMIT },
      sort: {
        direction: ColumnSortingDirection.ASC,
        field: 'key',
      },
    });
    expect(response.statusCode).toEqual(200);
  });
});
