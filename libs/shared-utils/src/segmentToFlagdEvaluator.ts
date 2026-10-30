// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FlagdTargeting1, ContextRuleCondition } from 'shared-types';

import propertyReference from './propertyReference.js';
import target from './target.js';

/**
 * Converts a segment and its rules into a FlagD evaluator.
 */
function segmentToFlagdEvaluator(
  segmentKey: string,
  segmentRuleConditions: ContextRuleCondition[],
  applicationName: string,
  environmentKey = '',
) {
  let evaluator: FlagdTargeting1;

  if (segmentRuleConditions.length > 1) {
    evaluator = {
      and: segmentRuleConditions.map((condition) => target(applicationName, environmentKey, condition)),
    };
  } else {
    const [condition] = segmentRuleConditions;

    evaluator = target(applicationName, environmentKey, condition);
  }

  return {
    [propertyReference(applicationName, environmentKey, segmentKey)]: evaluator,
  };
}

export default segmentToFlagdEvaluator;
