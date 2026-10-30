// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagEnvironmentsJoined, FeatureFlagEnvironmentsTableColumns } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

interface PatchFeatureFlagEnvironmentRequestPayload {
  body: Partial<Pick<FeatureFlagEnvironmentsTableColumns, 'defaultServeId' | 'enabled'>>;
  environmentId: string;
  featureFlagId: string;
}

export const patchFeatureFlagEnvironmentUrl = (environmentId: string, featureFlagId: string) =>
  `environments/${environmentId}/feature-flags/${featureFlagId}`;

async function patchFeatureFlagEnvironment(requestPayload: PatchFeatureFlagEnvironmentRequestPayload) {
  return await apiRequest<FeatureFlagEnvironmentsJoined>(
    patchFeatureFlagEnvironmentUrl(requestPayload.environmentId, requestPayload.featureFlagId),
    {
      method: 'PATCH',
      body: requestPayload.body,
    },
  );
}

export default patchFeatureFlagEnvironment;
