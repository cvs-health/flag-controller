// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

function getRuleConditionFieldId(id: string, position: number, fieldName: string): string {
  return `${id}-${position}-${fieldName}`;
}

export default getRuleConditionFieldId;
