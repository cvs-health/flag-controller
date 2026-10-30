// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';
import { user } from 'test/setup.js';

describe('patch/segments/[segmentId]', () => {
  const segment = {
    id: 'segment-1',
    applicationId: 'app-1',
    key: 'segmentKey',
    description: 'Description',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
  };
  const requestBody = { description: 'Description' };

  it('requests the route successfully', async () => {
    vi.mocked(mockServices.segments.updateSegment).mockResolvedValue(segment);

    const app = build();

    const response = await app.inject({
      method: 'PATCH',
      url: '/segments/segmentId',
      body: requestBody,
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(response.statusCode).toEqual(200);
    expect(mockServices.segments.updateSegment).toHaveBeenCalledExactlyOnceWith('segmentId', requestBody, user.id);
  });
});
