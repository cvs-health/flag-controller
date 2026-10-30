// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ApplicationsTableColumns, Scope, TeamsTableColumns } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { MetadataResponse, Pagination } from '../../typings/api';

export interface GetApplicationsApplication extends Pick<ApplicationsTableColumns, 'name' | 'id'> {
  team: Pick<TeamsTableColumns, 'name' | 'id'>;
}

export const getApplicationsUrl = (pagination: Pagination, scope: Scope) =>
  `applications?scope=${scope}&page=${pagination.page}&rows=${pagination.rows}`;

async function getApplications(pagination: Pagination, scope: Scope) {
  return await apiRequest<MetadataResponse<GetApplicationsApplication>>(getApplicationsUrl(pagination, scope));
}

export default getApplications;
