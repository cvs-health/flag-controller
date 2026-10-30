// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { AuditEntry } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { ColumnSorting, MetadataResponse, Pagination } from '../../typings/api';

export const getTeamAuditLogUrl = (teamId: string, search: string, pagination: Pagination, sort: ColumnSorting) =>
  `teams/${teamId}/audit-log?search=${search}&page=${pagination.page}&rows=${pagination.rows}&sort=${sort}`;

async function getTeamAuditLog(teamId: string, search: string, pagination: Pagination, sort: ColumnSorting) {
  return await apiRequest<MetadataResponse<AuditEntry>>(getTeamAuditLogUrl(teamId, search, pagination, sort));
}

export default getTeamAuditLog;
