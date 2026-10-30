// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ApplicationsTableColumns, TeamsTableColumns } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { MetadataResponse, Pagination } from '../../typings/api';

interface Team extends Pick<TeamsTableColumns, 'name' | 'id'> {
  applications: Pick<ApplicationsTableColumns, 'name' | 'id'>[];
}

export const getTeamsUrl = (pagination: Pagination) => `teams?page=${pagination.page}&rows=${pagination.rows}`;

async function getTeams(pagination: Pagination) {
  return await apiRequest<MetadataResponse<Team>>(getTeamsUrl(pagination));
}

export default getTeams;
