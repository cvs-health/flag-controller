// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { isEqual } from 'es-toolkit/predicate';
import type { ChangeDataTypes } from '../typings/audits';
import valueToString from './valueToString';
import { type DiffChanges, DiffType } from '../typings/audits';

/**
 * Compare each of the properties of the variations and return the differences
 * */
function compareVariations(variation1: ChangeDataTypes['variation'], variation2: ChangeDataTypes['variation']) {
  const differences: DiffChanges = {
    [DiffType.Add]: [],
    [DiffType.Change]: [],
    [DiffType.Remove]: [],
  };
  const variationKeys = new Set([...Object.keys(variation1), ...Object.keys(variation2)]);

  for (const key of variationKeys) {
    const keyExistsInOldVariations = key in variation1;
    const keyExistsInNewVariations = key in variation2;
    const oldValue = valueToString(variation1[key as keyof typeof variation1]);
    const newValue = valueToString(variation2[key as keyof typeof variation2]);

    if (keyExistsInOldVariations && keyExistsInNewVariations && !isEqual(oldValue, newValue)) {
      differences[DiffType.Change].push({
        property: key,
        oldValue,
        newValue,
      });
    }
  }

  return differences;
}

export default compareVariations;
