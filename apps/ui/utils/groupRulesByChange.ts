// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { RulesJoined } from 'shared-types';

import type { CreateFeatureFlagRuleRequestPayload } from '../api/requests/postRules';
import type { ParsedFeatureFlagRule } from './featureFlagRulesFormDataToRules';
import type { PatchFeatureFlagRulesRequestPayload } from '../api/requests/patchRules';
import isExistingRuleChanged from './isExistingRuleChanged';

type Rule = ParsedFeatureFlagRule;
type GroupedRule = Omit<ParsedFeatureFlagRule, 'created' | 'removed'>;
type ExistingGroupedRule = GroupedRule & { id: string };
type RulesById = Record<string, Omit<RulesJoined, 'updatedAt' | 'createdAt' | 'deletedAt' | 'segmentId'>>;

/**
 * An array of arrays where [0] are the new rules, [1] are the updated rules, and [2] are the deleted rules, and [3] are the unmodified rules
 */
function groupRulesByChange(rules: Rule[], existingRules: RulesJoined[]) {
  let orderPositionCounter = -1;
  const existingRulesById = existingRules.reduce<RulesById>((rules, rule) => {
    const { updatedAt, createdAt, deletedAt, segmentId, ...rest } = rule;
    return {
      ...rules,
      [rule.id]: rest,
    };
  }, {});

  return rules.reduce<
    [
      CreateFeatureFlagRuleRequestPayload[],
      PatchFeatureFlagRulesRequestPayload[],
      ExistingGroupedRule[],
      ExistingGroupedRule[],
    ]
  >(
    (rules, rule) => {
      orderPositionCounter++;

      const { created, removed, ...rest } = rule;
      const updatedRuleWithOrderPosition = {
        ...rest,
        orderPosition: orderPositionCounter,
      };

      if (removed) {
        orderPositionCounter--;
        return [rules[0], rules[1], [...rules[2], updatedRuleWithOrderPosition as ExistingGroupedRule], rules[3]];
      }

      if (created) {
        const { id, ...createdRule } = updatedRuleWithOrderPosition;
        return [[...rules[0], createdRule as CreateFeatureFlagRuleRequestPayload], rules[1], rules[2], rules[3]];
      }

      const existingRule = existingRulesById[rule.id || ''];

      if (existingRule && !isExistingRuleChanged(existingRule, updatedRuleWithOrderPosition)) {
        return [rules[0], rules[1], rules[2], [...rules[3], updatedRuleWithOrderPosition]];
      }

      // Unknown rules are also treated as updated rules
      return [
        rules[0],
        [...rules[1], updatedRuleWithOrderPosition as PatchFeatureFlagRulesRequestPayload],
        rules[2],
        rules[3],
      ];
    },
    [[], [], [], []],
  );
}

export default groupRulesByChange;
