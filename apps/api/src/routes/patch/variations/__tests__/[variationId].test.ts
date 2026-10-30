// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';

describe('patch/variation/:variationId', () => {
  it('successfully resolves', async () => {
    const body = { value: 'disabled' };
    const app = build();

    const response = await app.inject({
      method: 'PATCH',
      url: '/variations/variation-1',
      body,
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(app.services.variationsService.updateVariation).toHaveBeenCalledExactlyOnceWith('variation-1', body, '123');
    expect(response.statusCode).toEqual(200);
  });
});
