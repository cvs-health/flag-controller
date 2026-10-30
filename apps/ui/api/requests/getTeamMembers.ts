// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { User } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { MetadataResponse, Pagination } from '../../typings/api';

export const getTeamMembersUrl = (teamId: string, pagination: Pagination) =>
  `teams/${teamId}/members?page=${pagination.page}&rows=${pagination.rows}`;

async function getTeamMembers(teamId: string, pagination: Pagination) {
  return await apiRequest<MetadataResponse<User>>(getTeamMembersUrl(teamId, pagination));
}

export default getTeamMembers;
