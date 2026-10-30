// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ApplicationsTableColumns } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { MetadataResponse } from '../../typings/api';

export const getUserApplicationsUrl = (userId: string) => `users/${userId}/applications`;

async function getUserApplications(userId: string) {
  return await apiRequest<MetadataResponse<Pick<ApplicationsTableColumns, 'id' | 'name'>>>(
    getUserApplicationsUrl(userId),
  );
}

export default getUserApplications;
