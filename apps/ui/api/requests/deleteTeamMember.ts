// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import apiRequest from '../../utils/apiRequest';

interface RequestPayload {
  teamId: string;
  userId: string;
}

export const deleteTeamMemberUrl = (teamId: string, userId: string) => `teams/${teamId}/member/${userId}`;

async function deleteTeamMember(requestPayload: RequestPayload) {
  return await apiRequest(deleteTeamMemberUrl(requestPayload.teamId, requestPayload.userId), {
    method: 'DELETE',
  });
}

export default deleteTeamMember;
