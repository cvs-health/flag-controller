// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FocusEvent } from 'react';

export function validateRuleConditionField(
  event: FocusEvent<HTMLInputElement | HTMLSelectElement>,
  fieldName: string,
  _ruleOrderPosition: number,
  _position: number,
): string | null {
  const value = event.target.value.trim();

  if (!value) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required.`;
  }

  if (fieldName === 'context') {
    if (!/^\w*$/.test(value)) {
      return 'Context must only contain letters, numbers and underscores.';
    }
  }

  if (fieldName === 'attribute') {
    if (!/^\w+(\.\w+)*$/.test(value)) {
      return 'Attribute must follow valid dot notation (ex. address.city). No whitespace allowed.';
    }
  }

  return null;
}
