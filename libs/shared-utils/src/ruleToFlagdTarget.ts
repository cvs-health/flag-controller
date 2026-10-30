// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type {
  ContextRuleCondition,
  FlagdTargeting,
  FractionalRule,
  ResolvedSegmentRuleCondition,
  FractionalsTableColumns,
  TimeRuleCondition,
  EnvironmentKey,
} from 'shared-types';
import { FLAGD_TIMESTAMP } from 'shared-constants';
import { RuleServeType } from 'shared-types';

import fractionalTargeting from './fractionalTargeting.js';
import target from './target.js';

type Serve =
  | string
  | (Omit<FractionalsTableColumns, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> &
      Partial<Pick<FractionalsTableColumns, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>)
  | null;

/**
 * Converts a rule into a flagd targeting object.
 */
function ruleToFlagdTarget(
  conditions: (ContextRuleCondition | TimeRuleCondition | ResolvedSegmentRuleCondition)[],
  serve: Serve,
  serveType: RuleServeType,
  applicationName: string,
  environmentKey: EnvironmentKey,
  time: number | string = FLAGD_TIMESTAMP,
): FlagdTargeting {
  const targets = conditions.map((condition) => target(applicationName, environmentKey, condition, time));
  let serving: FractionalRule | string | null;

  if (serve && serveType === RuleServeType.Fractional) {
    const fractionalServe = serve as FractionalsTableColumns;

    serving = fractionalTargeting(fractionalServe.weights, fractionalServe.var);
  } else {
    serving = serve as string | null;
  }

  if (!targets.length) {
    return [serving];
  }

  if (targets.length > 1) {
    return [
      {
        and: targets,
      },
      serving,
    ];
  }

  return [targets[0], serving];
}

export default ruleToFlagdTarget;
