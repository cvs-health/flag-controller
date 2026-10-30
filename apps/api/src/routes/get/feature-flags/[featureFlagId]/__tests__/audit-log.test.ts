// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { FeatureFlagType } from 'shared-types';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';
import { PAGINATION_NO_LIMIT } from '../../../../../constants/pagination.js';
import { ColumnSortingDirection } from '../../../../../types/common.js';

describe('get/feature-flags/:featureFlagId/audit-log', () => {
  it('returns the audit log for the feature flag', async () => {
    const app = build();

    vi.mocked(mockServices.featureFlags.getFeatureFlagById).mockResolvedValue({
      applicationId: 'app-1',
      applicationName: 'app-one',
      archived: false,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      deletedAt: null,
      description: 'flag-description',
      id: 'feature-flag-1',
      key: 'flag-key',
      type: FeatureFlagType.Boolean,
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    });
    vi.mocked(mockServices.rules.listRules).mockResolvedValue({
      data: [
        {
          conditions: [],
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          deletedAt: null,
          environmentId: 'environment-id',
          flagId: 'feature-flag-1',
          flagKey: 'flag-key',
          id: 'rule-id',
          key: 'rule-key',
          orderPosition: 1,
          segmentId: null,
          segmentKey: null,
          serveFractional: null,
          serveFractionalId: null,
          serveVariationId: 'variation-id',
          serveVariationKey: 'variation-key',
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
    vi.mocked(mockServices.variations.listVariations).mockResolvedValue({
      data: [
        {
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          deletedAt: null,
          flagId: 'feature-flag-1',
          id: 'variation-id',
          key: 'variation-key',
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
          value: true,
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
      url: '/feature-flags/feature-flag-1/audit-log?page=1&rows=10',
    });

    await app.close();

    expect(app.services.featureFlagService.getFeatureFlagById).toHaveBeenCalledExactlyOnceWith('feature-flag-1');
    expect(app.services.rulesService.listRules).toHaveBeenCalledExactlyOnceWith({
      filters: {
        flagIds: ['feature-flag-1'],
      },
      pagination: {
        page: 1,
        rows: PAGINATION_NO_LIMIT,
      },
      sort: {
        direction: ColumnSortingDirection.ASC,
        field: 'key',
      },
    });
    expect(app.services.variationsService.listVariations).toHaveBeenCalledExactlyOnceWith({
      filters: {
        flagIds: ['feature-flag-1'],
      },
      pagination: {
        page: 1,
        rows: PAGINATION_NO_LIMIT,
      },
      sort: {
        direction: ColumnSortingDirection.ASC,
        field: 'key',
      },
    });
    expect(app.services.logsService.listLogs).toHaveBeenCalledExactlyOnceWith({
      filters: {
        and: {
          subjectIds: ['rule-id', 'variation-id', 'feature-flag-1'],
          applicationIds: ['app-1'],
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
