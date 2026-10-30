// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export enum ColumnSortingDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface Sort<F> {
  direction: ColumnSortingDirection;
  field: keyof F;
}

export interface IncludeFilters {
  archived?: boolean;
  deleted?: boolean;
}

export type Filters = Record<string, unknown>;

export type With = Record<string, boolean>;

export type ColumnSorting<F> = `${string & keyof F}:${ColumnSortingDirection}`;
