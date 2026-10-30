// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { SegmentsJoinedWithTargetCount } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { MetadataResponse, Pagination } from '../../typings/api';

export const getSegmentsUrl = (pagination: Pagination, search = '', sort = 'updatedAt:desc') =>
  `segments?search=${search}&sort=${sort}&page=${pagination.page}&rows=${pagination.rows}`;

async function getSegments(pagination: Pagination, search = '', sort = 'updatedAt:desc') {
  return await apiRequest<MetadataResponse<SegmentsJoinedWithTargetCount>>(getSegmentsUrl(pagination, search, sort));
}

export default getSegments;
