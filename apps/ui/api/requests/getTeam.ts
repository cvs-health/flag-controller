// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { TeamsTableColumns } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export const getTeamUrl = (teamName: string) => `teams/${teamName}`;

async function getTeam(teamName: string) {
  return await apiRequest<TeamsTableColumns>(getTeamUrl(teamName));
}

export default getTeam;
