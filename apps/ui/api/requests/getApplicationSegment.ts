// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { SegmentsJoined } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export const getApplicationSegmentUrl = (applicationName: string, segmentKey: string) =>
  `applications/${applicationName}/segments/${segmentKey}`;

async function getApplicationSegment(applicationName: string, segmentKey: string) {
  return await apiRequest<SegmentsJoined>(getApplicationSegmentUrl(applicationName, segmentKey));
}

export default getApplicationSegment;
