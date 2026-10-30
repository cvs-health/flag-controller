// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagType, FeatureFlagVariation } from 'shared-types';
import apiRequest from '../../utils/apiRequest';

interface FeatureFlag {
  defaultVariationKey: string;
  description: string;
  enabled: boolean;
  key: string;
  type: FeatureFlagType;
  variations: FeatureFlagVariation<FeatureFlagType>;
}

export interface CreateFeatureFlagRequestPayload {
  applicationId: string;
  body: FeatureFlag;
}

export const postFeatureFlagUrl = (applicationId: string) => `applications/${applicationId}/feature-flag`;

async function postFeatureFlag(requestPayload: CreateFeatureFlagRequestPayload) {
  return await apiRequest<CreateFeatureFlagRequestPayload>(postFeatureFlagUrl(requestPayload.applicationId), {
    method: 'POST',
    body: requestPayload.body,
  });
}

export default postFeatureFlag;
