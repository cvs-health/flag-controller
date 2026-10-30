// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import replaceRouteBasedOnSearchChange from '../replaceRouteBasedOnSearchChange';

describe('replaceRouteBasedOnSearchChange', () => {
  const mockRouter = {
    replace: vi.fn(),
  } as unknown as AppRouterInstance;

  const pathname = '/test-path';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should replace route with new search parameters', () => {
    const searchParams = new URLSearchParams() as ReadonlyURLSearchParams;
    const search = 'search';

    replaceRouteBasedOnSearchChange(search, searchParams, mockRouter, pathname);

    expect(mockRouter.replace).toHaveBeenCalledWith('/test-path?search=search&page=1', {
      scroll: false,
    });
  });
});
