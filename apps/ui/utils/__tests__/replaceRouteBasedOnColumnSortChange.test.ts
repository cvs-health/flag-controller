// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ColumnSortingDirection } from '../../typings/api';
import replaceRouteBasedOnColumnSortChange from '../replaceRouteBasedOnColumnSortChange';

describe('replaceRouteBasedOnColumnSortChange', () => {
  // @ts-ignore We don't need all of the properties of AppRouterInstance for these tests
  const router = {
    replace: vi.fn(),
  } as AppRouterInstance;
  const pathname = '/pathname';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should toggle direction when updating the same column', () => {
    const searchParams = new URLSearchParams() as ReadonlyURLSearchParams;
    const columnKey = 'name';
    const columnSorting = { column: 'name', direction: ColumnSortingDirection.ASC };

    replaceRouteBasedOnColumnSortChange(columnKey, columnSorting, searchParams, router, pathname);

    expect(router.replace).toHaveBeenCalledWith('/pathname?sort=name%3Adesc', { scroll: false });
  });

  it('should set ASC direction when updating a different column', () => {
    const searchParams = new URLSearchParams() as ReadonlyURLSearchParams;
    const columnKey = 'status';
    const columnSorting = { column: 'name', direction: ColumnSortingDirection.DESC };

    replaceRouteBasedOnColumnSortChange(columnKey, columnSorting, searchParams, router, pathname);

    expect(router.replace).toHaveBeenCalledWith('/pathname?sort=status%3Aasc', { scroll: false });
  });
});
