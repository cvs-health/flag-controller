// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { AuditEntry } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { ColumnSorting, MetadataResponse, Pagination } from '../../typings/api';

export const getApplicationAuditLogUrl = (applicationId: string, pagination: Pagination, sort: ColumnSorting) =>
  `applications/${applicationId}/audit-log?page=${pagination.page}&rows=${pagination.rows}&sort=${sort}`;

async function getApplicationAuditLog(applicationId: string, pagination: Pagination, sort: ColumnSorting) {
  return await apiRequest<MetadataResponse<AuditEntry>>(getApplicationAuditLogUrl(applicationId, pagination, sort));
}

export default getApplicationAuditLog;
