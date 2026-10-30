// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { RulesJoined } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export const getFeatureFlagRulesUrl = (environmentId: string, featureFlagId: string) =>
  `environments/${environmentId}/feature-flags/${featureFlagId}/rules`;

async function getFeatureFlagRules(environmentId: string, featureFlagId: string) {
  return await apiRequest<RulesJoined[]>(getFeatureFlagRulesUrl(environmentId, featureFlagId));
}

export default getFeatureFlagRules;
