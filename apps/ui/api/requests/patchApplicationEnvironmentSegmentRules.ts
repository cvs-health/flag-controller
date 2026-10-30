// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { SegmentRule } from 'shared-types';
import apiRequest from '../../utils/apiRequest';

export interface PatchApplicationEnvironmentSegmentRulesRequestPayload {
  applicationName: string;
  environmentKey: string;
  segmentKey: string;
  body: SegmentRule[];
}

export const patchApplicationEnvironmentSegmentRulesUrl = (
  applicationName: string,
  environmentKey: string,
  segmentKey: string,
) => `application/${applicationName}/environment/${environmentKey}/segment/${segmentKey}/rules`;

async function postApplicationEnvironmentSegmentRules(
  requestPayload: PatchApplicationEnvironmentSegmentRulesRequestPayload,
) {
  return await apiRequest<SegmentRule[]>(
    patchApplicationEnvironmentSegmentRulesUrl(
      requestPayload.applicationName,
      requestPayload.environmentKey,
      requestPayload.segmentKey,
    ),
    {
      method: 'PATCH',
      body: requestPayload.body,
    },
  );
}

export default postApplicationEnvironmentSegmentRules;
