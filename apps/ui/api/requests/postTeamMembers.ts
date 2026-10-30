// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import apiRequest from '../../utils/apiRequest';

interface RequestPayload {
  teamId: string;
  body: string[];
}

export const postTeamMembersUrl = (teamId: string) => `teams/${teamId}/members`;

async function postTeamMembers(requestPayload: RequestPayload) {
  return await apiRequest(postTeamMembersUrl(requestPayload.teamId), {
    method: 'POST',
    body: requestPayload.body,
  });
}

export default postTeamMembers;
