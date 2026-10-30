// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import getRuleConditionFieldId from '../getRuleConditionFieldId';

describe('getRuleConditionFieldId', () => {
  it('returns correct id format', () => {
    const result = getRuleConditionFieldId('1', 2, 'context');

    expect(result).toBe('1-2-context');
  });
});
