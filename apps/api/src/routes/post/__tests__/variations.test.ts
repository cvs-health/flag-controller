// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';

describe('post/feature-flag/:featureFlagId/variations', () => {
  it('successfully resolves', async () => {
    const body = [
      { flagId: 'feature-flag-1', key: 'on', value: true },
      { flagId: 'feature-flag-1', key: 'off', value: false },
    ];
    const app = build();

    const response = await app.inject({
      method: 'POST',
      url: '/variations',
      body,
    });

    await app.close();

    expect(app.services.variationsService.createManyVariations).toHaveBeenCalledExactlyOnceWith(body, '123');
    expect(response.statusCode).toEqual(200);
  });
});
