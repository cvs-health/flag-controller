// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { SegmentRule } from 'shared-types';
import apiRequest from '../../utils/apiRequest';

export interface PostApplicationEnvironmentSegmentRulesRequestPayload {
  applicationName: string;
  environmentKey: string;
  segmentKey: string;
  body: NewSegmentRule[];
}

export type NewSegmentRule = Omit<SegmentRule, 'id'>;

export const postApplicationEnvironmentSegmentRulesUrl = (
  applicationName: string,
  environmentKey: string,
  segmentKey: string,
) => `application/${applicationName}/environment/${environmentKey}/segment/${segmentKey}/rules`;

async function postApplicationEnvironmentSegmentRules(
  requestPayload: PostApplicationEnvironmentSegmentRulesRequestPayload,
) {
  return await apiRequest<SegmentRule[]>(
    postApplicationEnvironmentSegmentRulesUrl(
      requestPayload.applicationName,
      requestPayload.environmentKey,
      requestPayload.segmentKey,
    ),
    {
      method: 'POST',
      body: requestPayload.body,
    },
  );
}

export default postApplicationEnvironmentSegmentRules;
