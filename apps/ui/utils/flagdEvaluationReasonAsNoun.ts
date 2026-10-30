// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FlagdCore } from '@openfeature/flagd-core';

type EvaluationReason = ReturnType<FlagdCore['resolveBooleanEvaluation']>['reason'];

/**
 * Converts the evaluation reason to a human-readable string.
 */
function flagdEvaluationReasonAsNoun(reason: EvaluationReason) {
  switch (reason) {
    case 'DEFAULT':
      return 'a match against the default rule';
    case 'TARGETING_MATCH':
      return 'a match against a non-default rule';
    case 'SPLIT':
      return `a match against a rule's percentage roll-out`;
    case 'DISABLED':
      return 'the flag being disabled';
    case 'ERROR':
      return 'an error';
    case 'STATIC':
      return 'no defined non-default rules';
    default:
      return 'an unknown reason';
  }
}

export default flagdEvaluationReasonAsNoun;
