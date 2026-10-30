// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import apiRequest from '../../utils/apiRequest';

export interface PostApplicationRequestPayload {
  teamId: string;
  name: string;
}

export const postApplicationUrl = 'applications';

async function postApplication(requestPayload: PostApplicationRequestPayload) {
  return await apiRequest(postApplicationUrl, {
    method: 'POST',
    body: requestPayload,
  });
}

export default postApplication;
