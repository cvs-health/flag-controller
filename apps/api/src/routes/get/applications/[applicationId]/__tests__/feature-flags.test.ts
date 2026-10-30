// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';
import { ColumnSortingDirection } from '../../../../../types/common.js';

describe('get/applications/:applicationId/feature-flags', () => {
  it('requests the route successfully', async () => {
    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/applications/app-1/feature-flags?page=1&rows=10&search=test',
    });

    await app.close();

    expect(app.services.featureFlagService.listFeatureFlags).toHaveBeenCalledWith({
      filters: {
        applicationIds: ['app-1'],
        archived: undefined,
        search: 'test',
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
    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/applications/app-1/feature-flags?page=1&rows=10&archived=true',
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
