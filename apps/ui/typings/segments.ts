// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { RulesJoined, SegmentsTableColumns } from 'shared-types';

export interface SegmentWithRules extends SegmentsTableColumns {
  rules: RulesJoined[];
}
