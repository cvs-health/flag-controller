// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { EnvironmentTableColumns } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export const getApplicationEnvironmentsUrl = (applicationId: string) => `applications/${applicationId}/environments`;

async function getApplicationEnvironments(applicationId: string) {
  return await apiRequest<EnvironmentTableColumns[]>(getApplicationEnvironmentsUrl(applicationId));
}

export default getApplicationEnvironments;
