// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { ReadonlyURLSearchParams } from 'next/navigation';

import { ColumnSortingDirection } from '../typings/api';
import updateSearchParams from './updateSearchParams';

interface ColumnSorting {
  column: string;
  direction: ColumnSortingDirection;
}

function replaceRouteBasedOnColumnSortChange(
  columnKey: string,
  columnSorting: ColumnSorting,
  searchParams: ReadonlyURLSearchParams,
  router: AppRouterInstance,
  pathname: string,
) {
  let params = '';

  if (columnSorting.column === columnKey) {
    const direction =
      columnSorting.direction === ColumnSortingDirection.ASC ? ColumnSortingDirection.DESC : ColumnSortingDirection.ASC;

    params = updateSearchParams(searchParams, [['sort', `${columnKey}:${direction}`]]);
  } else {
    params = updateSearchParams(searchParams, [['sort', `${columnKey}:asc`]]);
  }

  router.replace(`${pathname}?${params}`, { scroll: false });
}

export default replaceRouteBasedOnColumnSortChange;
