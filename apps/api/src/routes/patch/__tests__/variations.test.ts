// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';

describe('patch/variations', () => {
  it('successfully resolves', async () => {
    const body = [{ id: 'variation-1', value: 'disabled' }];
    const app = build();

    const response = await app.inject({
      method: 'PATCH',
      url: '/variations',
      body,
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(app.services.variationsService.updateManyVariations).toHaveBeenCalledExactlyOnceWith(body, '123');
    expect(response.statusCode).toEqual(200);
  });
});
