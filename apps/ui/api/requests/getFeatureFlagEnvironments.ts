// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagEnvironmentsJoined } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export const getFeatureFlagEnvironmentsUrl = (featureFlagId: string) => `feature-flags/${featureFlagId}/environments`;

async function getFeatureFlagEnvironments(featureFlagId: string) {
  return await apiRequest<FeatureFlagEnvironmentsJoined[]>(getFeatureFlagEnvironmentsUrl(featureFlagId));
}

export default getFeatureFlagEnvironments;
