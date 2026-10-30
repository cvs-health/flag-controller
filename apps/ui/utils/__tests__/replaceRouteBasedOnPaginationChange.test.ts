// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import replaceRouteBasedOnPaginationChange from '../replaceRouteBasedOnPaginationChange';

describe('replaceRouteBasedOnPaginationChange', () => {
  // @ts-ignore We don't need all of the properties of AppRouterInstance for these tests
  const mockRouter = {
    replace: vi.fn(),
  } as AppRouterInstance;
  const pathname = '/pathname';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should replace route with page and rows parameters', () => {
    const searchParams = new URLSearchParams() as ReadonlyURLSearchParams;
    const paginationChange = { page: 3, pageSize: 25 };

    replaceRouteBasedOnPaginationChange(paginationChange, searchParams, mockRouter, pathname);

    expect(mockRouter.replace).toHaveBeenCalledWith('/pathname?page=3&rows=25', { scroll: false });
  });
});
