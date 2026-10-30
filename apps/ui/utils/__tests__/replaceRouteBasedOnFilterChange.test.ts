// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import replaceRouteBasedOnFilterChange from '../replaceRouteBasedOnFilterChange';

describe('replaceRouteBasedOnFilterChange', () => {
  // @ts-ignore We don't need all of the properties of AppRouterInstance for these tests
  const router = {
    replace: vi.fn(),
  } as AppRouterInstance;
  const pathname = '/pathname';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle replacing params for filters', () => {
    const searchParams = new URLSearchParams() as ReadonlyURLSearchParams;
    const filters = { type: 'rule' };

    replaceRouteBasedOnFilterChange(filters, searchParams, router, pathname);

    expect(router.replace).toHaveBeenCalledWith('/pathname?filters=type%3Drule&page=1', { scroll: false });
  });
});
