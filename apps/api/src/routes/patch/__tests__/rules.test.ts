// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';
import { user } from 'test/setup.js';

describe('patch/rules', () => {
  it('successfully resolve', async () => {
    const body = [{ id: 'rule-id', orderPosition: 1 }];
    const app = build();
    const response = await app.inject({
      method: 'PATCH',
      url: '/rules',
      body,
    });

    await app.close();

    expect(app.services.rulesService.updateMany).toHaveBeenCalledExactlyOnceWith(body, user.id);
    expect(response.statusCode).toEqual(200);
  });
});
