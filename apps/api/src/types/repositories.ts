// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { SQL } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

import type { Filters, Sort, With } from './common.js';

export type DeleteResult = {
  rowCount: number;
};

export type UpdateResult = {
  success: boolean;
};

export type CountResult = {
  count: number;
};

export type FindOptions = {
  orderBy?: SQL<unknown> | PgColumn;
  limit?: number;
  offset?: number;
};

export type RepositoryPaginationParams = {
  limit: number;
  offset?: number;
};

export interface RepositoryListParams<F = Filters, W = With, S = Record<string, unknown>> {
  filters?: F;
  pagination: RepositoryPaginationParams;
  sort?: Sort<S>;
  with?: W;
}

export interface FilterGroup<T> {
  and?: T;
  or?: T[];
}
