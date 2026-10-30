// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { SegmentRule } from 'shared-types';
import apiRequest from '../../utils/apiRequest';

export const getApplicationEnvironmentSegmentRulesUrl = (
  applicationName: string,
  environmentKey: string,
  segmentKey: string,
) => `application/${applicationName}/environment/${environmentKey}/segment/${segmentKey}/rules`;

async function getApplicationEnvironmentSegmentRules(
  applicationName: string,
  environmentKey: string,
  segmentKey: string,
) {
  return await apiRequest<SegmentRule[]>(
    getApplicationEnvironmentSegmentRulesUrl(applicationName, environmentKey, segmentKey),
  );
}

export default getApplicationEnvironmentSegmentRules;
