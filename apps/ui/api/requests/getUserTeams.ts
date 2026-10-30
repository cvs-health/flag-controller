// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { TeamsTableColumns } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { MetadataResponse } from '../../typings/api';

export const getUserTeamsUrl = (userId: string) => `users/${userId}/teams`;

async function getUserTeams(userId: string) {
  return await apiRequest<MetadataResponse<Pick<TeamsTableColumns, 'id' | 'name'>>>(getUserTeamsUrl(userId));
}

export default getUserTeams;
