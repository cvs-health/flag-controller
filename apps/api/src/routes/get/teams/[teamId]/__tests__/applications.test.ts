// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';

describe('get/teams/:teamId/applications', () => {
  it('returns the applications for the team', async () => {
    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/teams/team-1/applications?page=1&rows=10',
    });

    await app.close();

    expect(app.services.applicationsService.listApplications).toHaveBeenCalledWith({
      filters: {
        teamIds: ['team-1'],
      },
      pagination: {
        page: 1,
        rows: 10,
      },
      sort: { direction: 'asc', field: 'updatedAt' },
    });
    expect(response.statusCode).toEqual(200);
  });
});
