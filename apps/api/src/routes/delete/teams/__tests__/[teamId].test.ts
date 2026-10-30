// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';

describe('delete/team/:teamId', () => {
  it('soft deletes a team', async () => {
    const app = build();
    const response = await app.inject({
      method: 'DELETE',
      url: '/teams/team-1',
    });

    await app.close();

    expect(app.services.teamsService.deleteTeam).toHaveBeenCalledExactlyOnceWith('team-1', '123', false);
    expect(response.statusCode).toEqual(204);
  });
});
