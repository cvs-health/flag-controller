// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Scope, EnvironmentKey } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';
import { PAGINATION_NO_LIMIT } from '../../../constants/pagination.js';
import { ColumnSortingDirection } from '../../../types/common.js';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  listUserTeams: vi.fn(),
}));

vi.mock('../../../auth.js', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mocks.getSession(...args),
      listUserTeams: (...args: unknown[]) => mocks.listUserTeams(...args),
    },
  },
}));

describe('get/audit-logs', () => {
  it('returns only user-scoped applications', async () => {
    mocks.getSession.mockResolvedValue({
      user: {
        email: 'testuser@email.com',
        id: '123',
        name: 'Test User',
      },
    });
    mocks.listUserTeams.mockResolvedValue([{ id: 'team-1' }, { id: 'team-2' }]);

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
    vi.mocked(mockServices.applications.listApplications).mockResolvedValue({
      data: [
        {
          id: 'app-1',
          name: 'Application 1',
          teamId: 'team-1',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
          deletedAt: null,
          description: 'Description 1',
          teamName: 'Team 1',
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

    const app = build();

    const response = await app.inject({
      method: 'GET',
      url: `/audit-logs?page=1&rows=10&scope=${Scope.Me}&sort=createdAt:desc`,
    });

    await app.close();

    expect(mocks.listUserTeams).toHaveBeenCalledExactlyOnceWith({
      headers: expect.any(Headers),
    });
    expect(app.services.logsService.listLogs).toHaveBeenCalledExactlyOnceWith({
      filters: {
        and: {
          actionEndDate: undefined,
          actionStartDate: undefined,
          actionTypes: undefined,
          applicationIds: ['app-1'],
          environmentIds: [],
          search: undefined,
          subjectTypes: undefined,
        },
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

  it('returns the audit log', async () => {
    mocks.getSession.mockResolvedValue({
      user: {
        email: 'testuser@email.com',
        id: '123',
        name: 'Test User',
      },
    });

    const app = build();

    vi.mocked(mockServices.environments.listEnvironments).mockResolvedValue({
      data: [
        {
          applicationId: 'app-1',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          id: 'environment-id',
          key: EnvironmentKey.Development,
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
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
      url: '/audit-logs?page=1&rows=10&environmentKey=development&search=value&sort=createdAt:desc',
    });

    await app.close();

    expect(app.services.environmentsService.listEnvironments).toHaveBeenCalledExactlyOnceWith({
      filters: {
        keys: ['development'],
      },
      pagination: {
        page: 1,
        rows: PAGINATION_NO_LIMIT,
      },
      sort: {
        field: 'key',
        direction: ColumnSortingDirection.ASC,
      },
    });
    expect(app.services.logsService.listLogs).toHaveBeenCalledExactlyOnceWith({
      filters: {
        and: {
          actionEndDate: undefined,
          actionStartDate: undefined,
          actionTypes: undefined,
          applicationIds: [],
          environmentIds: ['environment-id'],
          search: 'value',
          subjectTypes: undefined,
        },
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
});
