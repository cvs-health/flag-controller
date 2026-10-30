// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';

describe('get/teams/:teamName', () => {
  it('requests the route successfully', async () => {
    const team = {
      createdAt: new Date(),
      deletedAt: null,
      id: 'id',
      memberCount: 0,
      name: 'team-1',
      organizationId: 'org-id',
      updatedAt: new Date(),
    };
    const app = build();

    vi.mocked(mockServices.teams.getTeamByName).mockResolvedValue(team);

    const response = await app.inject({
      method: 'GET',
      url: '/teams/team-1',
    });

    await app.close();

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual({
      ...team,
      updatedAt: team.updatedAt.toISOString(),
      createdAt: team.createdAt.toISOString(),
    });
  });
});
