// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  ActionType,
  EnvironmentKey,
  FeatureFlagType,
  Operator,
  RuleConditionValueType,
  SubjectType,
} from 'shared-types';
import { TimeRange } from '../typings/common';
import { RuleConditional, SegmentRuleConditional } from '../typings/rules';

export const queryStatusToCarbonLoadingStatus = {
  error: 'inactive',
  idle: 'inactive',
  pending: 'active',
  success: 'finished',
} as const;

export const featureFlagTypeLabels = {
  [FeatureFlagType.Boolean]: 'Boolean',
  [FeatureFlagType.Integer]: 'Number',
  [FeatureFlagType.String]: 'Text',
  [FeatureFlagType.Object]: 'Object',
};

export const ruleConditionValueTypeLabels = {
  [RuleConditionValueType.String]: 'Text',
  [RuleConditionValueType.Number]: 'Number',
  [RuleConditionValueType.Boolean]: 'Boolean',
};

export const operatorTranslation = {
  [Operator.In]: 'contains',
  [Operator.NotIn]: 'does not contain',
  [Operator.StartsWith]: 'starts with',
  [Operator.NotStartsWith]: 'does not start with',
  [Operator.EndsWith]: 'ends with',
  [Operator.NotEndsWith]: 'does not end with',
  [Operator.GreaterThan]: 'greater than',
  [Operator.GreaterThanOrEqual]: 'greater than or equal',
  [Operator.LessThan]: 'less than',
  [Operator.LessThanOrEqual]: 'less than or equal',
  [Operator.LooseEquals]: 'equals',
  [Operator.LooseInequality]: 'does not equal',
  [Operator.InList]: 'is one of',
  [Operator.NotInList]: 'is not one of',
  [Operator.Minor]: 'matches minor version',
  [Operator.Major]: 'matches major version',
};

export const timeOperatorTranslation = {
  [Operator.LessThan]: 'is before',
  [Operator.GreaterThan]: 'is after',
  [Operator.LessThanOrEqual]: 'is between',
};

export const segmentOperatorTranslation = {
  [Operator.LooseEquals]: 'is in',
  [Operator.Not]: 'is not in',
};

export const actionLabels = {
  [ActionType.Archive]: 'Archived',
  [ActionType.Create]: 'Created',
  [ActionType.Delete]: 'Deleted',
  [ActionType.Disable]: 'Disabled',
  [ActionType.Edit]: 'Edited',
  [ActionType.Enable]: 'Enabled',
  [ActionType.Restore]: 'Restored',
};

export const subjectTypeLabels = {
  [SubjectType.Application]: 'Application',
  [SubjectType.Context]: 'Context',
  [SubjectType.FeatureFlag]: 'Feature Flag',
  [SubjectType.FeatureFlagEnvironment]: 'Feature Flag Environment',
  [SubjectType.Rule]: 'Rule',
  [SubjectType.Segment]: 'Segment',
  [SubjectType.Team]: 'Team',
  [SubjectType.Variation]: 'Variation',
};

export const timeRangeLabels = {
  [TimeRange.None]: '',
  [TimeRange.Last60Minutes]: 'Last 60 minutes',
  [TimeRange.Last24Hours]: 'Last 24 hours',
  [TimeRange.Last7Days]: 'Last 7 days',
  [TimeRange.Last14Days]: 'Last 14 days',
  [TimeRange.Last30Days]: 'Last 30 days',
  [TimeRange.Last60Days]: 'Last 60 days',
  [TimeRange.Custom]: 'Custom',
};

export const environmentLabels = {
  [EnvironmentKey.Development]: 'Development',
  [EnvironmentKey.Production]: 'Production',
};

export const dateFormat = 'MM/dd/yyyy';

export const lowercaseKebabCasePattern = /^[a-z0-9]+((-[a-z0-9]+){1,})?$/;

export const segmentRuleConditionalTranslation = {
  [SegmentRuleConditional.IfContext]: 'IF CONTEXT',
  [SegmentRuleConditional.AndContext]: 'AND CONTEXT',
};

export const ruleConditionalTranslation = {
  [RuleConditional.If]: 'IF',
  [RuleConditional.And]: 'AND',
};

export const RULE_MARKED_FOR_REMOVAL_ORDER_POSITION = 9999;
