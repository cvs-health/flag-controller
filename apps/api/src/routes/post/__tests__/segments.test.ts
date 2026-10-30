// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';

const createSegmentResponse = {
  id: 'segment-1',
  applicationId: 'app-1',
  key: 'some-key',
  description: 'Description',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  deletedAt: null,
};

const requestBody = [
  {
    applicationId: 'app-1',
    key: 'some-key',
    description: 'Description',
  },
];

describe('post/segments', () => {
  it('requests the route successfully', async () => {
    vi.mocked(mockServices.segments.createManySegments).mockResolvedValue([createSegmentResponse]);
    const app = build();

    const response = await app.inject({
      method: 'POST',
      url: '/segments',
      body: requestBody,
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(response.statusCode).toEqual(200);
    expect(mockServices.segments.createManySegments).toHaveBeenCalledExactlyOnceWith(requestBody, '123');
    expect(JSON.parse(response.body)).toEqual([
      {
        ...createSegmentResponse,
        createdAt: createSegmentResponse.createdAt.toISOString(),
        updatedAt: createSegmentResponse.updatedAt.toISOString(),
      },
    ]);
  });
});
