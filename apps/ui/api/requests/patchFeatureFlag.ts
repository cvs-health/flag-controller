// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagsTableColumns } from 'shared-types';
import apiRequest from '../../utils/apiRequest';

interface PatchFeatureFlagRequestPayload {
  body: Partial<Pick<FeatureFlagsTableColumns, 'description' | 'archived'>>;
  featureFlagId: string;
}

export const patchFeatureFlagUrl = (featureFlagId: string) => `feature-flags/${featureFlagId}`;

async function patchFeatureFlag(requestPayload: PatchFeatureFlagRequestPayload) {
  return await apiRequest<FeatureFlagsTableColumns>(patchFeatureFlagUrl(requestPayload.featureFlagId), {
    method: 'PATCH',
    body: requestPayload.body,
  });
}

export default patchFeatureFlag;
