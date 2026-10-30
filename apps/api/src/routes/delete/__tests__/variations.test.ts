// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';

describe('delete/variations', () => {
  it('successfully resolves', async () => {
    const body = ['variation-1', 'variation-2'];
    const app = build();

    const response = await app.inject({
      method: 'DELETE',
      url: '/variations',
      body,
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(app.services.variationsService.deleteManyVariations).toHaveBeenCalledExactlyOnceWith(body, '123');
    expect(response.statusCode).toEqual(200);
  });
});
