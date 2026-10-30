// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';
import { user } from 'test/setup.js';

describe('delete/rules', () => {
  it('should successfully resolve', async () => {
    const body = ['rule-id'];
    const app = build();
    const response = await app.inject({
      method: 'DELETE',
      url: '/rules',
      body,
    });

    await app.close();

    expect(app.services.rulesService.deleteMany).toHaveBeenCalledExactlyOnceWith(body, user.id);
    expect(response.statusCode).toEqual(200);
  });
});
