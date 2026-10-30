// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FlagVariationsTableColumns } from 'shared-types';

function variationKeyFromId(variationId: string | null, variations: FlagVariationsTableColumns[] = []) {
  return variations.find((variation) => variation.id === variationId)?.key || '';
}

export default variationKeyFromId;
