// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { CreateVariationPayload } from 'shared-types';

import apiRequest from '../../utils/apiRequest';
import type { Variation } from '../../typings/variations';

export const postVariationsUrl = 'variations';

async function postVariations(requestPayload: CreateVariationPayload[]) {
  return await apiRequest<Variation[]>(postVariationsUrl, {
    method: 'POST',
    body: requestPayload,
  });
}

export default postVariations;
