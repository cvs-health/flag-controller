// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { ReadonlyURLSearchParams } from 'next/navigation';

import objectToSearchParams from './objectToSearchParams';
import updateSearchParams from './updateSearchParams';

function replaceRouteBasedOnFilterChange<F>(
  filters: Partial<F>,
  searchParams: ReadonlyURLSearchParams,
  router: AppRouterInstance,
  pathname: string,
) {
  const filtersParams = objectToSearchParams(filters);
  const params = updateSearchParams(searchParams, [
    ['filters', filtersParams],
    ['page', '1'],
  ]);

  router.replace(`${pathname}?${params}`, { scroll: false });
}

export default replaceRouteBasedOnFilterChange;
