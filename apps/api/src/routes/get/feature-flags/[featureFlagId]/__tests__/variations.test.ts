// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';

describe('get/feature-flags/:featureFlagId/variations', () => {
  it('returns the variations for the feature flag', async () => {
    const variations = [
      {
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        deletedAt: null,
        flagId: 'feature-flag-1',
        id: 'variation-1',
        key: 'on',
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        value: true,
      },
      {
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        deletedAt: null,
        flagId: 'feature-flag-1',
        id: 'variation-2',
        key: 'off',
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        value: false,
      },
    ];
    const app = build();

    vi.mocked(mockServices.variations.listVariations).mockResolvedValue({
      data: variations,
      metadata: { page: 1, records: 1, rows: 1, totalPages: 1, totalRecords: 1 },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/feature-flags/feature-flag-1/variations',
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(app.services.variationsService.listVariations).toHaveBeenCalledExactlyOnceWith({
      filters: { flagIds: ['feature-flag-1'] },
      pagination: { rows: -1, page: 1 },
      sort: { field: 'key', direction: 'asc' },
    });
    expect(response.statusCode).toEqual(200);
  });
});
