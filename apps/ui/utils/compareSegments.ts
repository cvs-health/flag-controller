// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import valueToString from './valueToString';
import type { ChangeDataTypes } from '../typings/audits';

/**
 * Compare each segment's description property and return the differences
 * */
function compareSegments(segment1: ChangeDataTypes['segment'], segment2: ChangeDataTypes['segment']) {
  if (segment1.description === segment2.description) {
    return [];
  }

  return [
    {
      property: 'description',
      oldValue: valueToString(segment1.description),
      newValue: valueToString(segment2.description),
    },
  ];
}

export default compareSegments;
