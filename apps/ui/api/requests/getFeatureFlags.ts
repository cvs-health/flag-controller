// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagListItem } from '../../typings/flags';
import type { MetadataResponse, Pagination } from '../../typings/api';
import apiRequest from '../../utils/apiRequest';

export const getFeatureFlagsUrl = (
  pagination: Pagination,
  search = '',
  summary = true,
  sort = 'key:asc',
  filter = '',
) =>
  `feature-flags?search=${search}&summary=${summary}&page=${pagination.page}&rows=${pagination.rows}&sort=${sort}${filter ? `&${filter}` : ''}`;

async function getFeatureFlags(pagination: Pagination, search = '', summary = true, sort = 'key:asc', filter = '') {
  return await apiRequest<MetadataResponse<FeatureFlagListItem>>(
    getFeatureFlagsUrl(pagination, search, summary, sort, filter),
  );
}

export default getFeatureFlags;
