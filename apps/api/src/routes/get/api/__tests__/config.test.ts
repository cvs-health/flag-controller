// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import testBuild from 'test/app.js';
import { localIdentityModes } from 'test/testUtils.js';

describe('get/api/config', () => {
  it('describes the configured sign-in method without a session', async () => {
    const app = testBuild();

    const response = await app.inject({
      method: 'GET',
      url: '/api/config',
    });

    await app.close();

    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual({
      authProviders: [{ id: 'github', label: 'GitHub', kind: 'social' }],
      features: {},
      modes: localIdentityModes,
    });
  });

  it('never exposes credentials or client ids', async () => {
    const app = testBuild();

    const response = await app.inject({
      method: 'GET',
      url: '/api/config',
    });

    await app.close();

    expect(response.body).not.toContain(process.env.GITHUB_CLIENT_ID);
    expect(response.body).not.toContain(process.env.GITHUB_CLIENT_SECRET);
  });
});
