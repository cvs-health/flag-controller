// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { RulesTableColumns } from 'shared-types';
import apiRequest from '../../utils/apiRequest';

export const deleteRulesUrl = 'rules';

async function deleteRules(requestPayload: string[]) {
  return await apiRequest<RulesTableColumns[]>(deleteRulesUrl, {
    method: 'DELETE',
    body: requestPayload,
  });
}

export default deleteRules;
