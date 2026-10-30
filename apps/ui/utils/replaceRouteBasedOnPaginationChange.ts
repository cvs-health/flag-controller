// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import updateSearchParams from './updateSearchParams';

export interface PaginationChange {
  page: number;
  pageSize: number;
}

function replaceRouteBasedOnPaginationChange(
  paginationChange: PaginationChange,
  searchParams: ReadonlyURLSearchParams,
  router: AppRouterInstance,
  pathname: string,
) {
  const params = updateSearchParams(searchParams, [
    ['page', paginationChange.page.toString()],
    ['rows', paginationChange.pageSize.toString()],
  ]);

  router.replace(`${pathname}?${params}`, { scroll: false });
}

export default replaceRouteBasedOnPaginationChange;
