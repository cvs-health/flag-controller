// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { ColumnSortingDirection } from '../../types/common.js';
import getFieldDirection from '../getFieldDirection.js';

describe('getFieldDirection', () => {
  it('returns the field and direction', () => {
    expect(getFieldDirection('enabled:desc')).toEqual(['enabled', ColumnSortingDirection.DESC]);
  });
});
