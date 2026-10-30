// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';

describe('get/environments/:environmentId/feature-flags/:featureFlagId', () => {
  it('should successfully resolve', async () => {
    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/environments/environment-id/feature-flags/feature-flag-id',
    });

    await app.close();

    expect(app.services.flagEnvironmentsService.getFlagEnvironment).toHaveBeenCalledExactlyOnceWith(
      'feature-flag-id',
      'environment-id',
    );
    expect(response.statusCode).toEqual(200);
  });
});
