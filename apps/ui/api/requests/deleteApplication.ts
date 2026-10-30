// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import apiRequest from '../../utils/apiRequest';

export interface DeleteApplicationRequestPayload {
  applicationId: string;
}

export const deleteApplicationUrl = (applicationId: string) => `applications/${applicationId}`;

async function deleteApplication(requestPayload: DeleteApplicationRequestPayload) {
  return await apiRequest<void>(deleteApplicationUrl(requestPayload.applicationId), {
    method: 'DELETE',
  });
}

export default deleteApplication;
