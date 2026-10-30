// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export function isOtelEnabled(): boolean {
  return process.env.OTEL_SDK_DISABLED !== 'true';
}
