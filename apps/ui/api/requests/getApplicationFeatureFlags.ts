// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import apiRequest from '../../utils/apiRequest';
import type { MetadataResponse, Pagination } from '../../typings/api';
import type { FeatureFlagListItem } from '../../typings/flags';

export const getApplicationFeatureFlagsUrl = (
  applicationId: string,
  pagination: Pagination,
  search = '',
  summary = true,
  sort = 'key:asc',
) =>
  `applications/${applicationId}/feature-flags?search=${search}&summary=${summary}&sort=${sort}&page=${pagination.page}&rows=${pagination.rows}`;

async function getApplicationFeatureFlags(
  applicationId: string,
  pagination: Pagination,
  search = '',
  summary = true,
  sort = 'key:asc',
) {
  return await apiRequest<MetadataResponse<FeatureFlagListItem>>(
    getApplicationFeatureFlagsUrl(applicationId, pagination, search, summary, sort),
  );
}

export default getApplicationFeatureFlags;
