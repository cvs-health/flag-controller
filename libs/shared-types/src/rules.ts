// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FractionalsTableColumns } from './fractionals';
import type { TimeZone } from './time';

export enum Clause {
  If = 'if',
  And = 'and',
  Then = 'then',
  SemVer = 'sem_ver',
}

export enum Operator {
  And = 'and',
  EndsWith = 'ends_with',
  NotEndsWith = '!ends_with',
  GreaterThan = '>',
  GreaterThanOrEqual = '>=',
  In = 'in',
  NotIn = '!in',
  InList = 'in_list',
  NotInList = '!in_list',
  LessThan = '<',
  LessThanOrEqual = '<=',
  LooseEquals = '==',
  LooseInequality = '!=',
  Major = '^',
  Minor = '~',
  None = 'none',
  Some = 'some',
  Not = '!',
  Or = 'or',
  StartsWith = 'starts_with',
  NotStartsWith = '!starts_with',
  StrictEquals = '===',
  StrictInequality = '!==',
}

export enum RuleServeType {
  Fractional = 'fractional',
  Variation = 'variation',
}

export enum RuleConditionValueType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
}

export enum RulesServeAction {
  Create = 'create',
  Update = 'update',
}

export enum RuleConditionType {
  Time = 'time',
  Context = 'context',
  Segment = 'segment',
}

export interface TimeRuleCondition {
  clause: Clause;
  endDate: string | null;
  operator: Operator;
  startDate: string;
  startDateTimeZone: TimeZone;
  endDateTimeZone: TimeZone | null;
  type: RuleConditionType.Time;
}

export interface SegmentRuleCondition {
  clause: Clause;
  operator: Operator;
  segmentId: string;
  type: RuleConditionType.Segment;
}

export interface ResolvedSegmentRuleCondition {
  clause: Clause;
  operator: Operator;
  segmentKey: string;
}

export interface ContextRuleCondition {
  attribute?: string;
  clause: Clause;
  context: string;
  operator: Operator;
  type: RuleConditionType.Context;
  values: Values;
  valuesType: RuleConditionValueType;
}

export interface SegmentRule extends RulesTableColumns {
  conditions: ContextRuleCondition[];
}

export type RuleCondition = TimeRuleCondition | ContextRuleCondition | SegmentRuleCondition;

export interface RulesTableColumns {
  conditions: RuleCondition[];
  createdAt: string;
  deletedAt: string | null;
  environmentId: string;
  flagId: string | null;
  id: string;
  key: string;
  orderPosition: number;
  segmentId: string | null;
  serveFractionalId: string | null;
  serveVariationId: string | null;
  updatedAt: string;
}

export interface RulesJoined extends RulesTableColumns {
  serveFractional: FractionalsTableColumns | null;
  serveVariationKey: string | null;
}

export interface CreateFractional {
  type: RuleServeType.Fractional;
  action: RulesServeAction.Create;
  value: FractionalValue;
}

export interface UpdateFractional {
  type: RuleServeType.Fractional;
  action: RulesServeAction.Update;
  id: string;
  value: FractionalValue;
}

export type CreateFeatureFlagRulePayload = Required<
  Omit<RulesTableColumns, 'deletedAt' | 'createdAt' | 'updatedAt' | 'segmentId' | 'id'>
> & { flagId: NonNullable<RulesTableColumns['flagId']> };

export type CreateSegmentRulePayload = Required<
  Omit<
    RulesTableColumns,
    'deletedAt' | 'createdAt' | 'updatedAt' | 'flagId' | 'id' | 'serveVariationId' | 'serveFractionalId'
  >
> & { segmentId: NonNullable<RulesTableColumns['segmentId']> };

export type UpdateFeatureFlagRulePayload = Required<Pick<RulesTableColumns, 'id'>> &
  Partial<Omit<CreateFeatureFlagRulePayload, 'environmentId' | 'key' | 'flagId'>>;

export type UpdateSegmentRulePayload = Required<Pick<RulesTableColumns, 'id'>> &
  Partial<Omit<CreateSegmentRulePayload, 'environmentId' | 'key' | 'segmentId'>>;

export type FractionalValue = Pick<FractionalsTableColumns, 'type' | 'var' | 'weights'>;

export type RulesCreateServe = CreateFractional;

export type RulesUpdateServe = UpdateFractional | CreateFractional;

export type Values = string | number | boolean | string[] | boolean[] | number[];
