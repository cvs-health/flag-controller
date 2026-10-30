// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';
import { userTeam } from 'test/setup.js';
import { PAGINATION_NO_LIMIT } from '../../../../../constants/pagination.js';
import { ColumnSortingDirection } from '../../../../../types/common.js';

describe('get/users/[userId]/applications', () => {
  it('returns the applications for the user', async () => {
    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/users/123/applications',
    });

    await app.close();

    expect(app.services.applicationsService.listApplications).toHaveBeenCalledWith({
      filters: {
        teamIds: [userTeam.id],
      },
      pagination: {
        page: 1,
        rows: PAGINATION_NO_LIMIT,
      },
      sort: {
        direction: ColumnSortingDirection.ASC,
        field: 'name',
      },
    });
    expect(response.statusCode).toEqual(200);
  });
});
