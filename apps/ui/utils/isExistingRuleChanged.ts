// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { isEqual } from 'es-toolkit/predicate';
import {
  RuleServeType,
  RulesServeAction,
  type UpdateFractional,
  type RulesJoined,
  type RuleCondition,
} from 'shared-types';

import type { ParsedFeatureFlagRule } from './featureFlagRulesFormDataToRules';
import type { RuleConditionWithId } from '../typings/rules';

type ExistingRuleForComparison = Omit<RulesJoined, 'updatedAt' | 'createdAt' | 'deletedAt' | 'segmentId'>;
type UpdatedRuleForComparison = Omit<ParsedFeatureFlagRule, 'created' | 'removed' | 'conditions'> & {
  conditions: (RuleConditionWithId | RuleCondition)[];
};

function getServeType(
  serveVariationId: string | null,
  serveFractionalId: string | null,
  serve?: ParsedFeatureFlagRule['serve'],
) {
  if (serveFractionalId || serve?.type === RuleServeType.Fractional) {
    return RuleServeType.Fractional;
  }

  if (serveVariationId) {
    return RuleServeType.Variation;
  }

  return null;
}

function isExistingRuleChanged(existingRule: ExistingRuleForComparison, updatedRule: UpdatedRuleForComparison) {
  const {
    serveVariationId: existingServeVariationId,
    serveFractionalId: existingServeFractionalId,
    serveVariationKey,
    serveFractional,
    ...existingRuleWithoutServe
  } = existingRule;
  const {
    serveVariationId: updatedServeVariationId,
    serveFractionalId: updatedServeFractionalId,
    serve: updatedServe,
    ...updatedRuleWithoutServe
  } = updatedRule;
  const existingRuleConditionsWithoutId = removeIdFromConditions(existingRuleWithoutServe.conditions);
  const existingRuleWithConditions = {
    ...existingRuleWithoutServe,
    conditions: existingRuleConditionsWithoutId,
  };
  const updatedRuleConditionsWithoutId = removeIdFromConditions(updatedRuleWithoutServe.conditions);
  const updateRuleWithConditions = {
    ...updatedRuleWithoutServe,
    conditions: updatedRuleConditionsWithoutId,
  };
  const existingServeType = getServeType(existingServeVariationId, existingServeFractionalId);
  const updatedServeType = getServeType(updatedServeVariationId, updatedServeFractionalId, updatedServe);
  const updatedFractionalServeId = (updatedServe as UpdateFractional)?.id;
  const isRuleUnchangedWithoutServe = isEqual(updateRuleWithConditions, existingRuleWithConditions);
  let isServeUnchanged = existingServeType === updatedServeType;

  if (isServeUnchanged && updatedServeType === RuleServeType.Variation) {
    isServeUnchanged = existingServeVariationId === updatedServeVariationId;
  }

  if (isServeUnchanged && updatedServeType === RuleServeType.Fractional) {
    if (!existingServeFractionalId && updatedServe) {
      isServeUnchanged = false;
    } else if (existingServeFractionalId && updatedServe) {
      // If new rule has a serve with Update action and the ID matches existing,
      // mark as changed because the serve content (weights, etc.) was edited
      const isUpdateAction = (updatedServe as UpdateFractional).action === RulesServeAction.Update;
      const isFractionalIdUnchanged =
        !!updatedFractionalServeId && existingServeFractionalId === updatedFractionalServeId;

      if (isUpdateAction && isFractionalIdUnchanged) {
        isServeUnchanged = false;
      } else {
        isServeUnchanged = isFractionalIdUnchanged;
      }
    } else {
      // No serve object, just compare the fractional IDs
      const isFractionalIdUnchanged =
        !!existingServeFractionalId && existingServeFractionalId === updatedServeFractionalId;

      isServeUnchanged = isFractionalIdUnchanged;
    }
  }

  return !(isRuleUnchangedWithoutServe && isServeUnchanged);
}

function removeIdFromConditions(conditions: (RuleConditionWithId | RuleCondition)[]) {
  return conditions.map((condition) => {
    if ('id' in condition) {
      const { id, ...conditionWithoutId } = condition;

      return conditionWithoutId;
    }
    return condition;
  });
}

export default isExistingRuleChanged;
