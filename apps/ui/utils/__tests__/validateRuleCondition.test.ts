// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FocusEvent } from 'react';
import { describe, expect, it } from 'vitest';
import { validateRuleConditionField } from '../validateRuleCondition';

function createMockEvent(value: string): FocusEvent<HTMLInputElement> {
  return {
    target: { value },
  } as FocusEvent<HTMLInputElement>;
}

describe('validateRuleConditionField', () => {
  describe('required validation', () => {
    it('returns error when value is empty', () => {
      const event = createMockEvent('');
      const result = validateRuleConditionField(event, 'context', 0, 0);
      expect(result).toBe('Context is required.');
    });

    it('returns error when value is whitespace only', () => {
      const event = createMockEvent('   ');
      const result = validateRuleConditionField(event, 'attribute', 0, 0);
      expect(result).toBe('Attribute is required.');
    });

    it('capitalizes field name in error message', () => {
      const event = createMockEvent('');
      const result = validateRuleConditionField(event, 'operator', 1, 2);
      expect(result).toBe('Operator is required.');
    });
  });

  describe('context validation', () => {
    it('returns null for valid context with letters', () => {
      const event = createMockEvent('user');
      const result = validateRuleConditionField(event, 'context', 0, 0);
      expect(result).toBeNull();
    });

    it('returns null for valid context with letters, numbers, and underscores', () => {
      const event = createMockEvent('user_123');
      const result = validateRuleConditionField(event, 'context', 0, 0);
      expect(result).toBeNull();
    });

    it('returns error for context with whitespace', () => {
      const event = createMockEvent('user name');
      const result = validateRuleConditionField(event, 'context', 0, 0);
      expect(result).toBe('Context must only contain letters, numbers and underscores.');
    });

    it('returns error for context with special characters', () => {
      const event = createMockEvent('user@name');
      const result = validateRuleConditionField(event, 'context', 0, 0);
      expect(result).toBe('Context must only contain letters, numbers and underscores.');
    });
  });

  describe('attribute validation', () => {
    it('returns null for valid attribute with single word', () => {
      const event = createMockEvent('email');
      const result = validateRuleConditionField(event, 'attribute', 0, 0);
      expect(result).toBeNull();
    });

    it('returns null for valid attribute with dot notation', () => {
      const event = createMockEvent('address.city');
      const result = validateRuleConditionField(event, 'attribute', 0, 0);
      expect(result).toBeNull();
    });

    it('returns null for valid attribute with multiple dots', () => {
      const event = createMockEvent('user.address.street.name');
      const result = validateRuleConditionField(event, 'attribute', 0, 0);
      expect(result).toBeNull();
    });

    it('returns error for attribute with whitespace', () => {
      const event = createMockEvent('address city');
      const result = validateRuleConditionField(event, 'attribute', 0, 0);
      expect(result).toBe('Attribute must follow valid dot notation (ex. address.city). No whitespace allowed.');
    });

    it('returns error for attribute starting with dot', () => {
      const event = createMockEvent('.address');
      const result = validateRuleConditionField(event, 'attribute', 0, 0);
      expect(result).toBe('Attribute must follow valid dot notation (ex. address.city). No whitespace allowed.');
    });

    it('returns error for attribute ending with dot', () => {
      const event = createMockEvent('address.');
      const result = validateRuleConditionField(event, 'attribute', 0, 0);
      expect(result).toBe('Attribute must follow valid dot notation (ex. address.city). No whitespace allowed.');
    });
  });

  describe('other fields', () => {
    it('returns null for valid values field', () => {
      const event = createMockEvent('value1, value2');
      const result = validateRuleConditionField(event, 'values', 0, 0);
      expect(result).toBeNull();
    });

    it('returns null for valid operator field', () => {
      const event = createMockEvent('equals');
      const result = validateRuleConditionField(event, 'operator', 0, 0);
      expect(result).toBeNull();
    });
  });
});
