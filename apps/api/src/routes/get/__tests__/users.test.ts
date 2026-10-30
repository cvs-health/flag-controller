// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';
import { ColumnSortingDirection } from '../../../types/common.js';

describe('get/users', () => {
  it('returns the users', async () => {
    vi.mocked(mockServices.users.listUsers).mockResolvedValue({
      data: [],
      metadata: {
        page: 1,
        rows: -1,
        records: 0,
        totalPages: 0,
        totalRecords: 0,
      },
    });

    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/users',
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(app.services.usersService.listUsers).toHaveBeenCalledExactlyOnceWith({
      pagination: {
        page: 1,
        rows: -1,
      },
      sort: {
        direction: ColumnSortingDirection.ASC,
        field: 'name',
      },
    });
    expect(response.statusCode).toEqual(200);
  });
});
