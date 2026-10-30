// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ColumnSortingDirection } from '../types/common.js';

function getFieldDirection<I>(query: string) {
  return query.split(':') as [keyof I, ColumnSortingDirection];
}

export default getFieldDirection;
