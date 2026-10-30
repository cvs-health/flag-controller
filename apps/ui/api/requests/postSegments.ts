// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { SegmentsTableColumns } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export const postSegmentsUrl = 'segments';

async function postSegments(requestPayload: Pick<SegmentsTableColumns, 'key' | 'description' | 'applicationId'>[]) {
  return await apiRequest<SegmentsTableColumns[]>(postSegmentsUrl, {
    method: 'POST',
    body: requestPayload,
  });
}

export default postSegments;
