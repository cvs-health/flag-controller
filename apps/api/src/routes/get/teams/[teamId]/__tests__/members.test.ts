// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';

describe('get/teams/:teamId/members', () => {
  it('returns the members for the team', async () => {
    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/teams/team-1/members?page=1&rows=10',
    });

    await app.close();

    expect(app.services.teamsService.listMembers).toHaveBeenCalledWith({
      filters: {
        teamIds: ['team-1'],
      },
      pagination: {
        page: 1,
        rows: 10,
      },
      sort: { direction: 'asc', field: 'name' },
    });
    expect(response.statusCode).toEqual(200);
  });
});
