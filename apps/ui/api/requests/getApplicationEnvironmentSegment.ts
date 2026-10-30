// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { Segment } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export const getApplicationEnvironmentSegmentUrl = (
  applicationName: string,
  environmentKey: string,
  segmentKey: string,
) => `application/${applicationName}/environment/${environmentKey}/segment/${segmentKey}`;

async function getApplicationEnvironmentSegment(applicationName: string, environmentKey: string, segmentKey: string) {
  return await apiRequest<Segment>(getApplicationEnvironmentSegmentUrl(applicationName, environmentKey, segmentKey));
}

export default getApplicationEnvironmentSegment;
