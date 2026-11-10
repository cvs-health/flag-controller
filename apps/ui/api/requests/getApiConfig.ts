// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { PublicConfig } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export const getApiConfigUrl = 'api/config';

async function getApiConfig() {
  return await apiRequest<PublicConfig>(getApiConfigUrl);
}

export default getApiConfig;
