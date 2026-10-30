// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';
import { user } from 'test/setup.js';

describe('post/rules', () => {
  it('should successfully resolve', async () => {
    const body = [
      {
        conditions: [],
        environmentId: 'environment-id',
        flagId: 'feature-flag-id',
        key: 'rule-key',
        orderPosition: 1,
        serveFractionalId: null,
        serveVariationId: 'variation-id',
      },
    ];
    const app = build();
    const response = await app.inject({
      method: 'POST',
      url: '/rules',
      body,
    });

    await app.close();

    expect(app.services.rulesService.createMany).toHaveBeenCalledExactlyOnceWith(body, user.id);
    expect(response.statusCode).toEqual(200);
  });
});
