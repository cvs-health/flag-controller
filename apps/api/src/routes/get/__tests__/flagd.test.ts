// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import build from 'test/app.js';

describe('get/flagd', () => {
  it('requests the route successfully', async () => {
    const app = build();

    await app.inject({
      method: 'GET',
      url: '/flagd',
    });

    await app.close();

    expect(app.services.flagdService.getFlagdConfiguration).toHaveBeenCalledExactlyOnceWith();
  });
});
