// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import apiRequest from '../../utils/apiRequest';

export const deleteTeamUrl = (teamId: string) => `teams/${teamId}`;

async function deleteTeam(teamId: string) {
  return await apiRequest<void>(deleteTeamUrl(teamId), {
    method: 'DELETE',
  });
}

export default deleteTeam;
