// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import validateDuplicateRuleKeyFormData from '../validateDuplicateRuleKeyFormData';

describe('validateDuplicateRuleKeyFormData', () => {
  it('should catch duplicates accurately', () => {
    const formData = new FormData();
    formData.append('key', 'rule-key');
    formData.append('key', 'rule-key-2');
    formData.append('key', 'rule-key-2');

    expect(validateDuplicateRuleKeyFormData(formData, 'rule-key')).toEqual(false);
    expect(validateDuplicateRuleKeyFormData(formData, 'rule-key-2')).toEqual(true);
  });
});
