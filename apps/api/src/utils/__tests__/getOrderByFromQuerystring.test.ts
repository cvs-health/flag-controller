// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { desc } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import getOrderByFromQuerystring from '../getOrderByFromQuerystring.js';
import { featureFlags } from 'db/schema/featureFlags.js';

describe('getOrderByFromQuerystring', () => {
  it('returns a clause based on the sort method', () => {
    expect(getOrderByFromQuerystring(featureFlags, 'key:asc', 'createdAt:asc')).toEqual(featureFlags.createdAt);
    expect(getOrderByFromQuerystring(featureFlags, 'key:asc', 'createdAt:desc')).toEqual(desc(featureFlags.createdAt));
    expect(getOrderByFromQuerystring(featureFlags, 'key:asc')).toEqual(featureFlags.key);
  });
});
