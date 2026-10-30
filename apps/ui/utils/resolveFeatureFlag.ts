// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FlagdCore, MemoryStorage } from '@openfeature/flagd-core';
import type { EvaluationContext } from '@openfeature/react-sdk';
import {
  EnvironmentKey,
  FeatureFlagType,
  RuleConditionType,
  RuleServeType,
  type ContextRuleCondition,
  type FlagVariationsTableColumns,
  type RulesJoined,
  type FractionalValue,
} from 'shared-types';
import { ruleToFlagdTarget, segmentToFlagdEvaluator, fractionalWeightsWithVariationKeys } from 'shared-utils';

import flagdEvaluationReasonAsNoun from './flagdEvaluationReasonAsNoun';
import mapIdTo from './mapIdTo';
import variationsByKeyValue from './variationsByKeyValue';
import type { SegmentWithRules } from '../typings/segments';

export interface ResolvingRule
  extends Omit<RulesJoined, 'createdAt' | 'deletedAt' | 'segmentId' | 'updatedAt' | 'serveFractional'>,
    Partial<Pick<RulesJoined, 'createdAt' | 'deletedAt' | 'segmentId' | 'updatedAt'>> {
  serveFractional: FractionalValue | null;
}

/**
 * Evaluates a feature flag in-app using the flagd-core library.
 */
function resolveFeatureFlag(
  rules: ResolvingRule[],
  variations: FlagVariationsTableColumns[],
  defaultVariationKey: string,
  context: EvaluationContext,
  featureFlagType: FeatureFlagType,
  segments: SegmentWithRules[],
  applicationId: string,
  time?: number | string,
): [string | null, string | null] {
  try {
    const variantsByKey = variationsByKeyValue(variations);
    const variantsByIdKey = mapIdTo(variations, 'key');
    const segmentsById = mapIdTo(segments);
    const flagStorage = new MemoryStorage(console);
    const flagdCore = new FlagdCore(flagStorage, console);
    const targeting = rules.flatMap((rule) => {
      const conditionsWithSegmentKeys = rule.conditions.map((condition) => {
        if (condition.type === RuleConditionType.Segment) {
          return {
            ...condition,
            segmentKey: segmentsById.get(condition.segmentId)?.key || '',
          };
        }
        return condition;
      });

      if (rule.serveFractional) {
        const fractionalServe = fractionalWeightsWithVariationKeys(variantsByIdKey, rule.serveFractional);

        return ruleToFlagdTarget(
          conditionsWithSegmentKeys,
          fractionalServe,
          RuleServeType.Fractional,
          applicationId,
          EnvironmentKey.Development,
          time,
        );
      }

      return ruleToFlagdTarget(
        conditionsWithSegmentKeys,
        rule.serveVariationKey,
        RuleServeType.Variation,
        applicationId,
        EnvironmentKey.Development,
        time,
      );
    });
    const $evaluators = segments.reduce((evaluators, segment) => {
      if (segment.rules?.length) {
        return {
          ...evaluators,
          ...segmentToFlagdEvaluator(
            segment.key,
            segment.rules[0]?.conditions as ContextRuleCondition[],
            segment.applicationId,
            EnvironmentKey.Development,
          ),
        };
      }

      return evaluators;
    }, {});

    flagdCore.setConfigurations(
      JSON.stringify({
        flags: {
          featureFlagKey: {
            variants: variantsByKey,
            state: 'ENABLED',
            defaultVariant: defaultVariationKey,
            targeting: targeting.length
              ? {
                  if: targeting,
                }
              : {},
          },
        },
        $evaluators,
      }),
    );

    let evaluation: ReturnType<
      | typeof flagdCore.resolveBooleanEvaluation
      | typeof flagdCore.resolveStringEvaluation
      | typeof flagdCore.resolveNumberEvaluation
      | typeof flagdCore.resolveObjectEvaluation
    >;

    switch (featureFlagType) {
      case FeatureFlagType.Boolean:
        evaluation = flagdCore.resolveBooleanEvaluation('featureFlagKey', false, context, console);
        break;
      case FeatureFlagType.String:
        evaluation = flagdCore.resolveStringEvaluation('featureFlagKey', '', context, console);
        break;
      case FeatureFlagType.Integer:
        evaluation = flagdCore.resolveNumberEvaluation('featureFlagKey', 0, context, console);
        break;
      default:
        // json
        evaluation = flagdCore.resolveObjectEvaluation('featureFlagKey', {}, context, console);
        break;
    }

    const reason = flagdEvaluationReasonAsNoun(evaluation.reason);
    const result = `Serving variation '${evaluation.variant}' with value '${typeof evaluation.value === 'object' ? JSON.stringify(evaluation.value) : evaluation.value}' due to ${reason}.`;

    return [result, null];
  } catch (error) {
    console.log('Error evaluating feature flag:', error);
    return [null, error?.toString() as string];
  }
}

export default resolveFeatureFlag;
