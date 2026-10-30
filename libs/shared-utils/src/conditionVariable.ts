// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

function conditionVariable(context: string, attribute?: string) {
  return `${context}${attribute ? `.${attribute}` : ''}`;
}

export default conditionVariable;
