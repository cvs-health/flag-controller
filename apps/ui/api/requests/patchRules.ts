// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type {
  CreateFractional,
  UpdateFractional,
  UpdateFeatureFlagRulePayload,
  UpdateSegmentRulePayload,
  RulesTableColumns,
} from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export type PatchFeatureFlagRulesRequestPayload = UpdateFeatureFlagRulePayload & {
  serve?: CreateFractional | UpdateFractional;
};
export type PatchSegmentRulesRequestPayload = UpdateSegmentRulePayload & {
  serve?: CreateFractional | UpdateFractional;
};

export const patchRulesUrl = 'rules';

async function patchRules(requestPayload: (PatchFeatureFlagRulesRequestPayload | PatchSegmentRulesRequestPayload)[]) {
  return await apiRequest<RulesTableColumns[]>(patchRulesUrl, {
    method: 'PATCH',
    body: requestPayload,
  });
}

export default patchRules;
