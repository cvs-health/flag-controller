// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  type ContextRuleCondition,
  type ErrorCode,
  type Problem,
  type ProblemFieldError,
  type ResolvedSegmentRuleCondition,
  type SegmentRuleCondition,
  type TimeRuleCondition,
  FieldErrorCode,
  PROBLEM_STATUSES,
  RuleConditionType,
} from 'shared-types';

type Condition = ContextRuleCondition | TimeRuleCondition | SegmentRuleCondition;

export function isResolvedSegmentRuleCondition(
  condition: ContextRuleCondition | TimeRuleCondition | ResolvedSegmentRuleCondition,
): condition is ResolvedSegmentRuleCondition {
  return Object.hasOwn(condition, 'segmentKey');
}

export function isSegmentRuleCondition(condition: Condition): condition is SegmentRuleCondition {
  return condition.type === RuleConditionType.Segment;
}

export function isTimeRuleCondition(condition: Condition): condition is TimeRuleCondition {
  return condition.type === RuleConditionType.Time;
}

export function isContextRuleCondition(condition: Condition): condition is ContextRuleCondition {
  return condition.type === RuleConditionType.Context;
}

const ERROR_CODES: ReadonlySet<string> = new Set(Object.keys(PROBLEM_STATUSES));
const FIELD_ERROR_CODES: ReadonlySet<string> = new Set(
  Object.keys(FieldErrorCode).map((key) => FieldErrorCode[key as keyof typeof FieldErrorCode]),
);

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && ERROR_CODES.has(value);
}

export function isFieldErrorCode(value: unknown): value is FieldErrorCode {
  return typeof value === 'string' && FIELD_ERROR_CODES.has(value);
}

function isProblemFieldError(value: unknown): value is ProblemFieldError {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ProblemFieldError>;

  return (
    typeof candidate.field === 'string' &&
    isFieldErrorCode(candidate.code) &&
    (candidate.detail === undefined || typeof candidate.detail === 'string')
  );
}

export function isProblem(value: unknown): value is Problem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<Problem>;

  return (
    typeof candidate.type === 'string' &&
    typeof candidate.title === 'string' &&
    Number.isInteger(candidate.status) &&
    isErrorCode(candidate.code) &&
    candidate.status === PROBLEM_STATUSES[candidate.code] &&
    (candidate.detail === undefined || typeof candidate.detail === 'string') &&
    (candidate.instance === undefined || typeof candidate.instance === 'string') &&
    (candidate.errors === undefined || (Array.isArray(candidate.errors) && candidate.errors.every(isProblemFieldError)))
  );
}
