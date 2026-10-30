// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';

describe('delete/variation/:variationId', () => {
  it('successfully resolves', async () => {
    const app = build();

    const response = await app.inject({
      method: 'DELETE',
      url: '/variations/variation-1',
      headers: {
        authorization: 'Bearer 1',
      },
    });

    await app.close();

    expect(app.services.variationsService.deleteVariation).toHaveBeenCalledExactlyOnceWith('variation-1', '123');
    expect(response.statusCode).toEqual(200);
  });
});
