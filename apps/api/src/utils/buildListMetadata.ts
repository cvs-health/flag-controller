// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ServicePaginationParams } from '../types/services.js';

export interface ListMetadataOptions {
  search?: string;
  sort?: string;
}

function buildListMetadata(
  data: unknown[],
  totalRecords: number,
  pagination: ServicePaginationParams,
  options?: ListMetadataOptions,
) {
  return {
    page: pagination.page,
    records: data.length,
    rows: pagination.rows,
    totalPages: pagination.rows > 0 ? Math.ceil(totalRecords / pagination.rows) : 0,
    totalRecords,
    ...(options?.search !== undefined ? { search: options.search } : {}),
    ...(options?.sort !== undefined ? { sort: options.sort } : {}),
  };
}

export default buildListMetadata;
