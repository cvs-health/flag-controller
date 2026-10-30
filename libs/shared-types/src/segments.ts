// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { SegmentRule } from './rules';

export interface Segment {
  applicationName: string;
  createdAt: string;
  description: string;
  environmentKey: string;
  id: string;
  key: string;
  updatedAt: string;
  rules: SegmentRule[];
}

export interface SegmentsTableColumns {
  applicationId: string;
  createdAt: string;
  deletedAt: string | null;
  description: string;
  id: string;
  key: string;
  updatedAt: string;
}
export interface SegmentsJoined extends SegmentsTableColumns {
  applicationName: string;
}

export interface SegmentsJoinedWithTargetCount extends SegmentsJoined {
  flagTargetCount: number;
}
