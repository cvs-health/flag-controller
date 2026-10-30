// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

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
});
