// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

export type ReactQueryStatus = 'idle' | 'success' | 'error' | 'pending';

type QueryData<T> = T extends (...args: never[]) => infer R ? Awaited<R> : T;

export type QueryOptions<T> = Omit<
  UseQueryOptions<QueryData<T>, unknown, QueryData<T>, unknown[]>,
  'queryKey' | 'queryFn'
>;

export type MutationOptions<R extends (...args: never[]) => unknown> = UseMutationOptions<
  Awaited<ReturnType<R>>,
  unknown,
  Parameters<R> extends [infer Item] ? Item : void
>;

export enum ColumnSortingDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export type ColumnSorting = `${string}:${ColumnSortingDirection}`;

export interface Pagination {
  page: number;
  rows: number;
}

export interface Metadata {
  page: number;
  records: number;
  rows: number;
  search: string;
  sort: ColumnSorting;
  summary: boolean;
  totalPages: number;
  totalRecords: number;
}

export interface MetadataResponse<D> {
  data: D[];
  metadata: Metadata;
}
