// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';
import { user } from 'test/setup.js';

describe('patch/applications/[applicationId]', () => {
  const application = {
    id: 'app-1',
    name: 'test-app',
    description: 'Updated',
    teamId: 'team-1',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
  };

  it('requests the route successfully', async () => {
    vi.mocked(mockServices.applications.updateApplication).mockResolvedValue(application);

    const app = build();

    const response = await app.inject({
      method: 'PATCH',
      url: '/applications/app-1',
      body: { description: 'Updated' },
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(response.statusCode).toEqual(200);
    expect(mockServices.applications.updateApplication).toHaveBeenCalledExactlyOnceWith(
      'app-1',
      { description: 'Updated' },
      user.id,
    );
  });
});
