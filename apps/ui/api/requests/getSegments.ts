// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Scope, type SegmentsJoinedWithTargetCount } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { MetadataResponse, Pagination } from '../../typings/api';

export const getSegmentsUrl = (pagination: Pagination, search = '', sort = 'updatedAt:desc', scope: Scope = Scope.All) =>
  `segments?search=${search}&sort=${sort}&page=${pagination.page}&rows=${pagination.rows}&scope=${scope}`;

async function getSegments(pagination: Pagination, search = '', sort = 'updatedAt:desc', scope: Scope = Scope.All,) {
  return await apiRequest<MetadataResponse<SegmentsJoinedWithTargetCount>>(getSegmentsUrl(pagination, search, sort, scope));
}

export default getSegments;
