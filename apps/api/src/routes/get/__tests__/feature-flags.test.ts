// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Scope } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { ColumnSortingDirection } from '../../../types/common.js';
import { mockServices } from 'test/testUtils.js';

describe('get/feature-flags', () => {
  it('requests the route successfully', async () => {
    vi.mocked(mockServices.applications.listApplications).mockResolvedValue({
      data: [],
      metadata: {
        page: 1,
        rows: 10,
        records: 0,
        totalPages: 0,
        totalRecords: 0,
      },
    });

    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/feature-flags?page=1&rows=10',
    });

    await app.close();

    expect(app.services.featureFlagService.listFeatureFlags).toHaveBeenCalledWith({
      filters: {
        applicationIds: [],
        archived: undefined,
        createdAtEndDate: undefined,
        createdAtStartDate: undefined,
        enabled: undefined,
        environmentKeys: undefined,
        featureFlagTypes: undefined,
        search: undefined,
        updatedAtEndDate: undefined,
        updatedAtStartDate: undefined,
      },
      pagination: {
        page: 1,
        rows: 10,
      },
      with: {
        environments: true,
      },
      sort: {
        direction: ColumnSortingDirection.ASC,
        field: 'key',
      },
    });
    expect(response.statusCode).toEqual(200);
  });

  it('passes the archived filter through to the service', async () => {
    vi.mocked(mockServices.applications.listApplications).mockResolvedValue({
      data: [],
      metadata: {
        page: 1,
        rows: 10,
        records: 0,
        totalPages: 0,
        totalRecords: 0,
      },
    });

    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/feature-flags?page=1&rows=10&archived=true',
    });

    await app.close();

    expect(app.services.featureFlagService.listFeatureFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ archived: true }),
      }),
    );
    expect(response.statusCode).toEqual(200);
  });

  it("filters to the user's applications when the scope is me", async () => {
    vi.mocked(mockServices.applications.listApplications).mockResolvedValue({
      data: [
        {
          id: 'app-1',
          name: 'Application 1',
          teamId: 'team-1',
          teamName: 'Team 1',
          description: null,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
          deletedAt: null,
        },
      ],
      metadata: {
        page: 1,
        rows: 1,
        records: 1,
        totalPages: 1,
        totalRecords: 1,
      },
    });

    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: `/feature-flags?page=1&rows=10&scope=${Scope.Me}`,
    });

    await app.close();

    expect(app.services.featureFlagService.listFeatureFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ applicationIds: ['app-1'] }),
      }),
    );
    expect(response.statusCode).toEqual(200);
  });

  it('does not filter by application when the scope is all', async () => {
    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: `/feature-flags?page=1&rows=10&scope=${Scope.All}`,
    });

    await app.close();

    expect(mockServices.applications.listApplications).not.toHaveBeenCalled();
    expect(app.services.featureFlagService.listFeatureFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ applicationIds: undefined }),
      }),
    );
    expect(response.statusCode).toEqual(200);
  });

  it('rejects an unknown scope', async () => {
    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/feature-flags?page=1&rows=10&scope=everyone',
    });

    await app.close();

    expect(app.services.featureFlagService.listFeatureFlags).not.toHaveBeenCalled();
    expect(response.statusCode).toEqual(400);
  });
});
