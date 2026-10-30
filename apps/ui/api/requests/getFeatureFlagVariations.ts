// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FlagVariationsTableColumns } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export const getFeatureFlagVariationsUrl = (featureFlagId: string) => `feature-flags/${featureFlagId}/variations`;

async function getFeatureFlagVariations(featureFlagId: string) {
  return await apiRequest<FlagVariationsTableColumns[]>(getFeatureFlagVariationsUrl(featureFlagId));
}

export default getFeatureFlagVariations;
