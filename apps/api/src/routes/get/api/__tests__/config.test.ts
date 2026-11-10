// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import { auth } from '../../../../auth.js';
import build from '../../../../app.js';
import testBuild from 'test/app.js';

describe('get/api/config', () => {
  it('describes the configured sign-in method without a session', async () => {
    vi.spyOn(auth.api, 'getSession').mockResolvedValue(null);
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
      modes: {},
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

  it('is documented in the OpenAPI spec', async () => {
    const app = await build({ logger: false });
    await app.ready();

    const operation = app.swagger().paths?.['/api/config']?.get;

    await app.close();

    expect(operation?.tags).toEqual(['config']);
    expect(operation?.responses).toHaveProperty('200');
    expect(operation?.security).toEqual([]);
  });
});
