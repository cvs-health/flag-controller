// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import routeWhitelisted from '../routeWhitelisted.js';

describe('routeWhitelisted', () => {
  it('returns true for whitelisted routes, their subpaths, and query strings', () => {
    expect(routeWhitelisted('/flagd')).toEqual(true);
    expect(routeWhitelisted('/healthz')).toEqual(true);
    expect(routeWhitelisted('/healthz?probe=1')).toEqual(true);
    expect(routeWhitelisted('/documentation')).toEqual(true);
    expect(routeWhitelisted('/documentation/static/index.html')).toEqual(true);
    expect(routeWhitelisted('/api/auth/session')).toEqual(true);
  });

  it('returns false for non-whitelisted routes', () => {
    expect(routeWhitelisted('/api/users')).toEqual(false);
    expect(routeWhitelisted('/api/other')).toEqual(false);
    expect(routeWhitelisted(undefined)).toEqual(false);
  });

  it('anchors matches so lookalike paths are not whitelisted', () => {
    expect(routeWhitelisted('/applications/documentation')).toEqual(false);
    expect(routeWhitelisted('/flagd-admin')).toEqual(false);
    expect(routeWhitelisted('/api/auth-bypass')).toEqual(false);
  });
});
