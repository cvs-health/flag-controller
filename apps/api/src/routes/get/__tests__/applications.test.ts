// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';
import { ColumnSortingDirection } from '../../../types/common.js';

describe('get/applications', () => {
  it('returns the applications', async () => {
    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/applications?page=1&rows=10',
    });

    await app.close();

    expect(app.services.applicationsService.listApplications).toHaveBeenCalledWith({
      filters: {
        teamIds: undefined,
      },
      pagination: {
        page: 1,
        rows: 10,
      },
      with: {
        teams: true,
      },
      sort: {
        direction: ColumnSortingDirection.ASC,
        field: 'name',
      },
    });
    expect(response.statusCode).toEqual(200);
  });
});
