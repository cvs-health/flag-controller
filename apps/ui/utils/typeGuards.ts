// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { Variation, VariationLegacy } from '../typings/variations';

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isLegacyVariations(variations: VariationLegacy | Variation[] | null): variations is VariationLegacy {
  return !Array.isArray(variations);
}
