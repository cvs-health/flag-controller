// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ColumnSortingDirection } from '../types/common.js';
import type { OrderByTemplate } from '../types/fastify.js';

function listParamsSortToString(field: string, direction: ColumnSortingDirection): OrderByTemplate {
  return `${field}:${direction}`;
}

export default listParamsSortToString;
