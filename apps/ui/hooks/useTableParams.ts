// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type ChangeEvent, useCallback, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { Scope } from 'shared-types';

import replaceRouteBasedOnSearchChange from '../utils/replaceRouteBasedOnSearchChange';
import replaceRouteBasedOnPaginationChange, {
  type PaginationChange,
} from '../utils/replaceRouteBasedOnPaginationChange';
import { ColumnSortingDirection } from '../typings/api';
import replaceRouteBasedOnColumnSortChange from '../utils/replaceRouteBasedOnColumnSortChange';
import replaceRouteBasedOnFilterChange from '../utils/replaceRouteBasedOnFilterChange';

/**
 * Manages table parameters such as search (debounced) and pagination by syncing them with the URL.
 */
function useTableParams(defaultSortColumn = '', defaultSortDirection = ColumnSortingDirection.DESC) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = useMemo(() => searchParams.get('search') || '', [searchParams]);
  const filters = useMemo(() => searchParams.get('filters') || '', [searchParams]);
  const scope = useMemo(() => (searchParams.get('scope') === Scope.All ? Scope.All : Scope.Me), [searchParams]);
  const pagination = useMemo(
    () => ({
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      rows: searchParams.get('rows') ? Number(searchParams.get('rows')) : 10,
    }),
    [searchParams],
  );
  const columnSorting = useMemo(
    () => ({
      column: searchParams.get('sort')?.split(':')[0] || defaultSortColumn,
      direction: (searchParams.get('sort')?.split(':')[1] as ColumnSortingDirection) || defaultSortDirection,
    }),
    [searchParams, defaultSortColumn, defaultSortDirection],
  );
  const updateSearchSearchParams = useCallback(
    (newSearch: string) => {
      replaceRouteBasedOnSearchChange(newSearch, searchParams, router, pathname);
    },
    [pathname, router, searchParams],
  );
  const debounceSearchChange = useMemo(() => debounce(updateSearchSearchParams, 500), [updateSearchSearchParams]);
  const updateSearch = useCallback(
    (event: string | ChangeEvent<HTMLInputElement>) => {
      if (event) {
        debounceSearchChange((event as ChangeEvent<HTMLInputElement>).target.value);
      }
    },
    [debounceSearchChange],
  );
  const updateSort = useCallback(
    (columnKey: string) => {
      replaceRouteBasedOnColumnSortChange(columnKey, columnSorting, searchParams, router, pathname);
    },
    [columnSorting, searchParams, router, pathname],
  );
  const updatePagination = useCallback(
    (change: PaginationChange) => {
      replaceRouteBasedOnPaginationChange(change, searchParams, router, pathname);
    },
    [searchParams, router, pathname],
  );
  function updateFilters<F>(filters: Partial<F>) {
    replaceRouteBasedOnFilterChange(filters, searchParams, router, pathname);
  }

  return {
    columnSorting,
    filters,
    pagination,
    scope,
    search,
    updateFilters,
    updatePagination,
    updateSearch,
    updateSort,
  };
}

export default useTableParams;
