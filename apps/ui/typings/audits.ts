// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type {
  ActionType,
  AuditEntry,
  ContextRuleCondition,
  EnvironmentKey,
  FeatureFlagEnvironmentsJoined,
  FeatureFlagsTableColumns,
  FlagVariationsTableColumns,
  ResolvedSegmentRuleCondition,
  RulesJoined,
  SegmentsTableColumns,
  SubjectType,
  TeamsTableColumns,
  TimeRuleCondition,
} from 'shared-types';

import type { TimeRange } from './common';

export enum DiffType {
  Change = 'change',
  Add = 'add',
  Remove = 'remove',
}

export interface DiffPropertyChange {
  newValue: string;
  oldValue: string;
  property: string;
}

export type DiffChanges = Record<DiffType, DiffPropertyChange[]>;

type Rule = Omit<RulesJoined, 'conditions'> & {
  conditions: (ContextRuleCondition | ResolvedSegmentRuleCondition | TimeRuleCondition)[];
};

export interface ChangeDataTypes {
  entry: AuditEntry['oldData'];
  flag: FeatureFlagsTableColumns;
  flagEnvironment: FeatureFlagEnvironmentsJoined;
  null: null;
  rule: Rule;
  segment: SegmentsTableColumns;
  variation: FlagVariationsTableColumns;
  team: TeamsTableColumns;
}

export interface LogFilters {
  actionEndDate: string;
  actionStartDate: string;
  actionTypes: ActionType[];
  environmentKeys: EnvironmentKey[];
  subjectTypes: SubjectType[];
  timeRange: TimeRange;
}
