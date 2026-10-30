// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ApplicationsJoined } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export const getApplicationUrl = (applicationName: string) => `applications/${applicationName}`;

async function getApplication(applicationName: string) {
  return await apiRequest<ApplicationsJoined>(getApplicationUrl(applicationName));
}

export default getApplication;
