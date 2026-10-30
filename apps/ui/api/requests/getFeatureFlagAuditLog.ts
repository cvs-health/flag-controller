// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { AuditEntry } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { MetadataResponse, Pagination, ColumnSorting } from '../../typings/api';

export const getFeatureFlagAuditLogUrl = (featureFlagId: string, pagination: Pagination, sort: ColumnSorting) =>
  `feature-flags/${featureFlagId}/audit-log?page=${pagination.page}&rows=${pagination.rows}&sort=${sort}`;

async function getFeatureFlagAuditLog(featureFlagId: string, pagination: Pagination, sort: ColumnSorting) {
  return await apiRequest<MetadataResponse<AuditEntry>>(getFeatureFlagAuditLogUrl(featureFlagId, pagination, sort));
}

export default getFeatureFlagAuditLog;
