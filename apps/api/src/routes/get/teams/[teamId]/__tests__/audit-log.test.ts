// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { SubjectType } from 'shared-types';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';
import { PAGINATION_NO_LIMIT } from '../../../../../constants/pagination.js';
import { ColumnSortingDirection } from '../../../../../types/common.js';

describe('get/teams/:teamId/audit-log', () => {
  it('returns the audit log for the team', async () => {
    const app = build();

    vi.mocked(mockServices.applications.listApplications).mockResolvedValue({
      data: [
        {
          id: 'app-1',
          name: 'app-name',
          teamId: 'team1',
          teamName: 'test-team',
          description: null,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
          deletedAt: null,
        },
      ],
      metadata: {
        page: 1,
        records: 1,
        rows: 1,
        totalPages: 1,
        totalRecords: 1,
      },
    });
    vi.mocked(mockServices.logs.listLogs).mockResolvedValue({
      data: [],
      metadata: {
        page: 1,
        records: 0,
        rows: 10,
        search: '',
        sort: 'createdAt:desc',
        totalPages: 0,
        totalRecords: 0,
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/teams/team1/audit-log?page=1&rows=10',
    });

    await app.close();

    expect(app.services.applicationsService.listApplications).toHaveBeenCalledExactlyOnceWith({
      filters: {
        teamIds: ['team1'],
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
    expect(app.services.logsService.listLogs).toHaveBeenCalledExactlyOnceWith({
      filters: {
        and: { search: undefined },
        or: [{ applicationIds: ['app-1'] }, { subjectTypes: [SubjectType.Team], subjectIds: ['team1'] }],
      },
      pagination: {
        page: 1,
        rows: 10,
      },
      sort: {
        direction: ColumnSortingDirection.DESC,
        field: 'createdAt',
      },
    });
    expect(response.statusCode).toEqual(200);
  });

  it('queries team entries when the team has no applications', async () => {
    const app = build();

    vi.mocked(mockServices.applications.listApplications).mockResolvedValue({
      data: [],
      metadata: {
        page: 1,
        records: 0,
        rows: 0,
        totalPages: 0,
        totalRecords: 0,
      },
    });

    const result = {
      data: [],
      metadata: {
        page: 2,
        records: 0,
        rows: 10,
        search: 'team',
        sort: 'createdAt:asc' as const,
        totalPages: 0,
        totalRecords: 0,
      },
    };
    vi.mocked(mockServices.logs.listLogs).mockResolvedValue(result);

    const response = await app.inject({
      method: 'GET',
      url: '/teams/team1/audit-log?page=2&rows=10&search=team&sort=createdAt:asc',
    });

    await app.close();

    expect(app.services.applicationsService.listApplications).toHaveBeenCalledExactlyOnceWith({
      filters: {
        teamIds: ['team1'],
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
    expect(app.services.logsService.listLogs).toHaveBeenCalledExactlyOnceWith({
      filters: {
        and: { search: 'team' },
        or: [{ subjectTypes: [SubjectType.Team], subjectIds: ['team1'] }],
      },
      pagination: { page: 2, rows: 10 },
      sort: { field: 'createdAt', direction: ColumnSortingDirection.ASC },
    });
    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual(result);
  });
});
