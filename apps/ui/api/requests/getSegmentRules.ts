// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { RulesJoined } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export const getSegmentRulesUrl = (environmentId: string, segmentId: string) =>
  `environments/${environmentId}/segments/${segmentId}/rules`;

async function getSegmentRules(environmentId: string, segmentId: string) {
  return await apiRequest<RulesJoined[]>(getSegmentRulesUrl(environmentId, segmentId));
}

export default getSegmentRules;
