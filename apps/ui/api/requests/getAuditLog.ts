// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Scope, type AuditEntry } from 'shared-types';

import type { ColumnSorting, MetadataResponse, Pagination } from '../../typings/api';
import apiRequest from '../../utils/apiRequest';

export const getAuditLogUrl = (
  search: string,
  pagination: Pagination,
  sort: ColumnSorting,
  filter = '',
  scope: Scope = Scope.All,
) =>
  `audit-logs?search=${search}&page=${pagination.page}&rows=${pagination.rows}&sort=${sort}&scope=${scope}${filter ? `&${filter}` : ''}`;

async function getAuditLog(
  search: string,
  pagination: Pagination,
  sort: ColumnSorting,
  filter = '',
  scope: Scope = Scope.All,
) {
  return await apiRequest<MetadataResponse<AuditEntry>>(getAuditLogUrl(search, pagination, sort, filter, scope));
}

export default getAuditLog;
