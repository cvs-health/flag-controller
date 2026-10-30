// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ApplicationsTableColumns } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { MetadataResponse, Pagination } from '../../typings/api';

export const getTeamApplicationsUrl = (teamId: string, pagination: Pagination) =>
  `teams/${teamId}/applications?page=${pagination.page}&rows=${pagination.rows}`;

async function getTeamApplications(teamId: string, pagination: Pagination) {
  return await apiRequest<MetadataResponse<ApplicationsTableColumns>>(getTeamApplicationsUrl(teamId, pagination));
}

export default getTeamApplications;
