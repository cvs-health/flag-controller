// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type {
  CreateFeatureFlagRulePayload,
  CreateFractional,
  CreateSegmentRulePayload,
  RulesTableColumns,
} from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export type CreateFeatureFlagRuleRequestPayload = CreateFeatureFlagRulePayload & { serve?: CreateFractional };
export type CreateSegmentRuleRequestPayload = CreateSegmentRulePayload & { serve?: CreateFractional };

export const postRulesUrl = 'rules';

async function postRules(requestPayload: (CreateFeatureFlagRuleRequestPayload | CreateSegmentRuleRequestPayload)[]) {
  return await apiRequest<RulesTableColumns[]>(postRulesUrl, {
    method: 'POST',
    body: requestPayload,
  });
}

export default postRules;
