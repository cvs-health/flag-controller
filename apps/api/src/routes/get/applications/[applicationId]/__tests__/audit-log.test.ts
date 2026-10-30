// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';
import { ColumnSortingDirection } from '../../../../../types/common.js';

describe('get/applications/:applicationId/audit-log', () => {
  it('returns the audit log for the application', async () => {
    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/applications/app-1/audit-log?page=1&rows=1',
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(app.services.logsService.listLogs).toHaveBeenCalledExactlyOnceWith({
      filters: { and: { applicationIds: ['app-1'] } },
      pagination: {
        page: 1,
        rows: 1,
      },
      sort: {
        field: 'createdAt',
        direction: ColumnSortingDirection.DESC,
      },
    });
    expect(response.statusCode).toEqual(200);
  });
});
