// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagsJoined } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export const getFeatureFlagUrl = (applicationName: string, featureFlagKey: string) =>
  `applications/${applicationName}/feature-flags/${featureFlagKey}`;

async function getFeatureFlag(applicationName: string, featureFlagKey: string) {
  return await apiRequest<FeatureFlagsJoined>(getFeatureFlagUrl(applicationName, featureFlagKey));
}

export default getFeatureFlag;
