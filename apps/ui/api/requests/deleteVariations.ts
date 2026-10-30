// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import apiRequest from '../../utils/apiRequest';
import type { Variation } from '../../typings/variations';

export const deleteVariationsUrl = 'variations';

async function deleteVariations(requestPayload: string[]) {
  return await apiRequest<Variation[]>(deleteVariationsUrl, {
    method: 'DELETE',
    body: requestPayload,
  });
}

export default deleteVariations;
