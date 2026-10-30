// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { Segment } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export interface PatchSegmentRequestPayload {
  segmentId: string;
  body: PatchSegmentRequest;
}

interface PatchSegmentRequest extends Pick<Segment, 'description'> {}

export const patchSegmentUrl = (segmentId: string) => `segments/${segmentId}`;

async function patchSegment(requestPayload: PatchSegmentRequestPayload) {
  return await apiRequest<PatchSegmentRequestPayload>(patchSegmentUrl(requestPayload.segmentId), {
    method: 'PATCH',
    body: requestPayload.body,
  });
}

export default patchSegment;
