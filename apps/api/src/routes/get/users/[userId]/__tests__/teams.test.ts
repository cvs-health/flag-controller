// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode, PROBLEM_CONTENT_TYPE } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';
import build from 'test/app.js';
import { PAGINATION_NO_LIMIT } from '../../../../../constants/pagination.js';
import { auth } from '../../../../../auth.js';
import { ColumnSortingDirection } from '../../../../../types/common.js';

describe('get/users/[userId]/teams', () => {
  it('returns the teams for the user', async () => {
    vi.spyOn(auth.api, 'getSession').mockResolvedValueOnce({
      user: {
        id: '123',
        name: 'Test User',
        email: 'testuser@email.com',
      },
      session: {
        activeOrganizationId: 'org-123',
      },
    } as never);

    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/users/123/teams',
    });

    await app.close();

    expect(app.services.teamsService.listTeams).toHaveBeenCalledWith({
      filters: {
        organizationId: 'org-123',
        userId: '123',
      },
      pagination: {
        page: 1,
        rows: PAGINATION_NO_LIMIT,
      },
      sort: {
        direction: ColumnSortingDirection.DESC,
        field: 'updatedAt',
      },
    });
    expect(response.statusCode).toEqual(200);
  });

  it('returns 400 when no active organization is set', async () => {
    vi.spyOn(auth.api, 'getSession').mockResolvedValueOnce({
      user: {
        id: '123',
        name: 'Test User',
        email: 'testuser@email.com',
      },
      session: {
        activeOrganizationId: null,
      },
    } as never);

    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/users/123/teams',
    });

    await app.close();

    expect(app.services.teamsService.listTeams).not.toHaveBeenCalled();
    expect(response.statusCode).toEqual(400);
    expect(response.headers['content-type']).toContain(PROBLEM_CONTENT_TYPE);
    expect(JSON.parse(response.body)).toMatchObject({
      status: 400,
      code: ErrorCode.Validation,
      detail: 'No active organization.',
    });
  });
});
