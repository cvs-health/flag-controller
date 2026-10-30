// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { user } from 'test/setup.js';
import build from 'test/app.js';

describe('delete/application/:applicationId', () => {
  it('deletes an application', async () => {
    const app = build();
    const response = await app.inject({
      method: 'DELETE',
      url: '/applications/123',
    });

    await app.close();

    expect(app.services.applicationsService.deleteApplication).toHaveBeenCalledExactlyOnceWith('123', user.id);
    expect(response.statusCode).toEqual(204);
  });
});
