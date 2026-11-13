// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import { IdentityManagedError } from '../../../errors/AppError.js';
import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';

describe('post /applications', () => {
  const validBody = {
    name: 'my-new-app',
    teamId: 'team-123',
    description: 'A test application',
  };

  it('should create an application and return 201', async () => {
    const mockCreated = {
      id: 'abc123',
      name: 'my-new-app',
      description: 'A test application',
      teamId: 'team-123',
      deletedAt: null,
      createdAt: '2026-04-09T00:00:00.000Z',
      updatedAt: '2026-04-09T00:00:00.000Z',
    };

    const createApplication = vi.fn().mockResolvedValue(mockCreated);
    const app = build();

    vi.mocked(mockServices.applications.createApplication).mockImplementation(createApplication);

    const response = await app.inject({
      method: 'POST',
      url: '/applications',
      body: validBody,
    });

    await app.close();

    expect(app.services.applicationsService.createApplication).toHaveBeenCalledExactlyOnceWith(validBody, '123');
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body)).toEqual(mockCreated);
  });

  it('should return 400 when required fields are missing', async () => {
    const app = build();

    const response = await app.inject({
      method: 'POST',
      url: '/applications',
      body: { teamId: 'team-123' },
    });

    await app.close();

    expect(response.statusCode).toEqual(400);
  });

  it('answers 403 with an IDENTITY_MANAGED problem when the identity provider owns applications', async () => {
    vi.mocked(mockServices.applications.createApplication).mockRejectedValue(
      new IdentityManagedError({ message: 'x', detail: 'Applications are managed by your identity provider.' }),
    );
    const app = build();

    const response = await app.inject({
      method: 'POST',
      url: '/applications',
      payload: { name: 'checkout-web', teamId: 'team-1', description: 'Checkout storefront' },
    });

    await app.close();

    expect(response.statusCode).toEqual(403);
    expect(response.json()).toMatchObject({
      type: 'urn:fliposs:error:identity-managed',
      code: 'IDENTITY_MANAGED',
      detail: 'Applications are managed by your identity provider.',
    });
  });
});
