// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';

const segment = {
  applicationId: 'app-1',
  applicationName: 'test-app',
  createdAt: new Date('2023-10-01T00:00:00Z'),
  deletedAt: null,
  description: 'description',
  id: '1',
  key: 'segmentKey',
  updatedAt: new Date('2023-10-01T00:00:00Z'),
};

describe('get/applications/:applicationName/segments/:segmentKey', () => {
  it('requests the route successfully', async () => {
    vi.mocked(mockServices.segments.getSegmentByApplicationNameAndKey).mockResolvedValue(segment);

    const app = build();

    const response = await app.inject({
      method: 'GET',
      url: '/applications/test-app/segments/segmentKey',
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(mockServices.segments.getSegmentByApplicationNameAndKey).toHaveBeenCalledExactlyOnceWith(
      'test-app',
      'segmentKey',
    );
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual({
      ...segment,
      createdAt: segment.createdAt.toISOString(),
      updatedAt: segment.updatedAt.toISOString(),
    });
  });
});
