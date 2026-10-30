// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';

describe('get/applications/:applicationName', () => {
  it('returns the application', async () => {
    const app = build();
    const response = await app.inject({
      method: 'GET',
      url: '/applications/app-1',
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(app.services.applicationsService.getApplicationByName).toHaveBeenCalledWith('app-1');
    expect(response.statusCode).toEqual(200);
  });
});
