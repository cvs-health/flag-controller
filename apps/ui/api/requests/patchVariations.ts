// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { UpdateVariationPayload } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { Variation } from '../../typings/variations';

export const patchVariationsUrl = 'variations';

async function patchVariations(requestPayload: UpdateVariationPayload[]) {
  return await apiRequest<Variation[]>(patchVariationsUrl, {
    method: 'PATCH',
    body: requestPayload,
  });
}

export default patchVariations;
