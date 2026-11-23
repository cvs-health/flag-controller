// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Scope } from 'shared-types';

import type { FeatureFlagListItem } from '../../typings/flags';
import type { MetadataResponse, Pagination } from '../../typings/api';
import apiRequest from '../../utils/apiRequest';

export const getFeatureFlagsUrl = (
  pagination: Pagination,
  search = '',
  summary = true,
  sort = 'key:asc',
  filter = '',
  scope = Scope.Me,
) =>
  `feature-flags?search=${search}&summary=${summary}&page=${pagination.page}&rows=${pagination.rows}&sort=${sort}&scope=${scope}${filter ? `&${filter}` : ''}`;

async function getFeatureFlags(
  pagination: Pagination,
  search = '',
  summary = true,
  sort = 'key:asc',
  filter = '',
  scope = Scope.Me,
) {
  return await apiRequest<MetadataResponse<FeatureFlagListItem>>(
    getFeatureFlagsUrl(pagination, search, summary, sort, filter, scope),
  );
}

export default getFeatureFlags;
