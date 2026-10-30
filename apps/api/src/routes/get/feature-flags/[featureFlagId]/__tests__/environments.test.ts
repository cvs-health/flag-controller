// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { EnvironmentKey, FeatureFlagType } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';
import { PAGINATION_NO_LIMIT } from '../../../../../constants/pagination.js';
import { ColumnSortingDirection } from '../../../../../types/common.js';

describe('get/feature-flags/:featureFlagId/environments', () => {
  it('returns the environments for the feature flag', async () => {
    const environment = {
      applicationId: 'app-1',
      applicationName: 'app-one',
      archived: false,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      defaultServeId: 'variation-id',
      defaultServeKey: 'on',
      deletedAt: null,
      description: 'flag-description',
      enabled: true,
      environmentId: 'environment-id',
      environmentKey: EnvironmentKey.Development,
      flagId: 'flag-id',
      flag: {
        applicationId: 'application-id',
        key: 'flag-key',
      },
      type: FeatureFlagType.Boolean,
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    vi.mocked(mockServices.flagEnvironments.listFlagEnvironments).mockResolvedValue({
      data: [environment],
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
      url: '/feature-flags/feature-flag-1/environments',
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(app.services.flagEnvironmentsService.listFlagEnvironments).toHaveBeenCalledExactlyOnceWith({
      filters: { flagIds: ['feature-flag-1'] },
      pagination: { rows: PAGINATION_NO_LIMIT, page: 1 },
      sort: { field: 'environmentKey', direction: ColumnSortingDirection.ASC },
    });
    expect(response.statusCode).toEqual(200);
  });
});
