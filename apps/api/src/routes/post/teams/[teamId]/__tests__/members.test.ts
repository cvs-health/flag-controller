// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';

describe('post/teams/:teamId/members', () => {
  it('adds the members to the team on behalf of the caller', async () => {
    const app = build();
    const response = await app.inject({
      method: 'POST',
      url: '/teams/team-1/members',
      payload: ['user-1', 'user-2'],
    });

    await app.close();

    expect(app.services.teamsService.addMembers).toHaveBeenCalledExactlyOnceWith('team-1', ['user-1', 'user-2'], '123');
    expect(response.statusCode).toEqual(201);
  });
});
