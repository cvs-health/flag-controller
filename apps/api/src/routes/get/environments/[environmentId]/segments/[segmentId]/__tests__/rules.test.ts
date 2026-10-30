// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';
import { PAGINATION_NO_LIMIT } from '../../../../../../../constants/pagination.js';
import { ColumnSortingDirection } from '../../../../../../../types/common.js';

describe('get/environments/:environmentId/segments/:segmentId/rules', () => {
  it('should successfully resolve', async () => {
    vi.mocked(mockServices.rules.listRules).mockResolvedValue({
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
      url: '/environments/environment-id/segments/segment-id/rules',
    });

    await app.close();

    expect(app.services.rulesService.listRules).toHaveBeenCalledExactlyOnceWith({
      filters: { environmentIds: ['environment-id'], segmentIds: ['segment-id'] },
      sort: { field: 'orderPosition', direction: ColumnSortingDirection.ASC },
      pagination: { rows: PAGINATION_NO_LIMIT, page: 1 },
    });
    expect(response.statusCode).toEqual(200);
  });
});
