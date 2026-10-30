// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { desc } from 'drizzle-orm';
import type { AnyPgColumn, AnyPgTable } from 'drizzle-orm/pg-core';

import { type ColumnSorting, ColumnSortingDirection, type Sort } from '../types/common.js';
import getFieldDirection from './getFieldDirection.js';

type SortableColumns = AnyPgTable | Record<string, AnyPgColumn>;

/**
 * Creates an order by clause for database queries based on column and sort method
 */
function getOrderByFromSort<TColumns extends SortableColumns, TFields extends object>(
  columns: TColumns,
  defaultSort: ColumnSorting<TFields>,
  sort?: Sort<TFields>,
) {
  const [defaultField, defaultDirection] = getFieldDirection<TFields>(defaultSort);
  const field = (sort?.field ?? defaultField) as string;
  const typedColumns = columns as Record<string, AnyPgColumn>;
  const column = typedColumns[field] ?? typedColumns[defaultField as string];

  return (sort?.direction ?? defaultDirection) === ColumnSortingDirection.ASC ? column : desc(column);
}

export default getOrderByFromSort;
