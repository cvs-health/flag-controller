// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';

describe('delete/teams/:teamId/member/:userId', () => {
  it('removes the member from the team on behalf of the caller', async () => {
    const app = build();
    const response = await app.inject({
      method: 'DELETE',
      url: '/teams/team-1/member/user-1',
    });

    await app.close();

    expect(app.services.teamsService.removeMember).toHaveBeenCalledExactlyOnceWith('team-1', 'user-1', '123');
    expect(response.statusCode).toEqual(204);
  });
});
