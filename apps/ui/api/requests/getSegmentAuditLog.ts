// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { AuditEntry } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { ColumnSorting, MetadataResponse, Pagination } from '../../typings/api';

export const getSegmentAuditLogUrl = (segmentId: string, pagination: Pagination, sort: ColumnSorting) =>
  `segments/${segmentId}/audit-log?page=${pagination.page}&rows=${pagination.rows}&sort=${sort}`;

async function getSegmentAuditLog(segmentId: string, pagination: Pagination, sort: ColumnSorting) {
  return await apiRequest<MetadataResponse<AuditEntry>>(getSegmentAuditLogUrl(segmentId, pagination, sort));
}

export default getSegmentAuditLog;
