// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCorsOrigins } from '../getCorsOrigins.js';

describe('getCorsOrigins', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to localhost:3000 when CORS_ORIGIN is unset', () => {
    vi.stubEnv('CORS_ORIGIN', undefined);
    expect(getCorsOrigins()).toEqual(['http://localhost:3000']);
  });

  it('returns a single-item array for a single origin', () => {
    vi.stubEnv('CORS_ORIGIN', 'https://fliposs-ui.dev.cvshealth.com');
    expect(getCorsOrigins()).toEqual(['https://fliposs-ui.dev.cvshealth.com']);
  });

  it('splits and trims a comma-separated list of origins', () => {
    vi.stubEnv('CORS_ORIGIN', 'https://a.example.com, https://b.example.com,https://c.example.com');
    expect(getCorsOrigins()).toEqual(['https://a.example.com', 'https://b.example.com', 'https://c.example.com']);
  });
});
