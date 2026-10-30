// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  type ContextRuleCondition,
  RuleConditionType,
  RuleServeType,
  type FeatureFlagType,
  type FeatureFlagVariation,
  type FlagdFlagConfiguration,
  type FlagdTargeting,
  type ResolvedSegmentRuleCondition,
  type TimeRuleCondition,
  type EnvironmentKey,
} from 'shared-types';
import {
  propertyReference,
  ruleToFlagdTarget,
  segmentToFlagdEvaluator,
  fractionalWeightsWithVariationKeys,
} from 'shared-utils';

import featureFlagVariantsBasedOnFeatureFlagType from 'utils/featureFlagVariantsBasedOnFeatureFlagType.js';
import type { FeatureFlagsSelect } from 'repositories/featureFlagsRepository.js';
import type { FlagEnvironmentsSelect } from 'repositories/flagEnvironmentsRepository.js';
import type { FlagVariationsSelect } from 'repositories/flagVariationsRepository.js';
import type { FractionalsSelect } from 'repositories/fractionalsRepository.js';
import type { RulesListItem } from 'repositories/rulesRepository.js';
import type { SegmentsSelect } from 'repositories/segmentsRepository.js';
import { InternalError } from '../errors/AppError.js';
import { ColumnSortingDirection } from '../types/common.js';
import { PAGINATION_NO_LIMIT } from '../constants/pagination.js';
import type { ServiceDependencies } from '../types/services.js';

export type FlagdService = ReturnType<typeof createFlagdService>;

function createFlagdService({ repositories }: ServiceDependencies) {
  return {
    getFlagdConfiguration: async (): Promise<FlagdFlagConfiguration> => {
      try {
        const featureFlagsResult = await repositories.featureFlagsRepository.list({
          pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
        });
        const featureFlagIds = featureFlagsResult.map((flag) => flag.id);
        const [flagEnvironmentsResult, rulesResult] = await Promise.all([
          repositories.flagEnvironmentsRepository.list({
            filters: { flagIds: featureFlagIds },
            pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
          }),
          repositories.rulesRepository.list({
            pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
            sort: { field: 'orderPosition', direction: ColumnSortingDirection.ASC },
          }),
        ]);
        const { environmentIds } = collectFlagEnvironmentIds(flagEnvironmentsResult);
        const { rulesSegmentIds, rulesFractionalIds, rulesBySegmentId, rulesByFlagEnvironment } =
          collectRuleIndexes(rulesResult);
        const [flagVariationsResult, segmentsResult, applicationsResult, fractionalsResult, environmentsResult] =
          await Promise.all([
            listWhenIdsPresent(featureFlagIds, () =>
              repositories.flagVariationsRepository.list({
                filters: { flagIds: featureFlagIds },
                pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
              }),
            ),
            listWhenIdsPresent(rulesSegmentIds, () =>
              repositories.segmentsRepository.list({
                filters: { segmentIds: rulesSegmentIds },
                pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
              }),
            ),
            repositories.applicationsRepository.list({ pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 } }),
            listWhenIdsPresent(rulesFractionalIds, () =>
              repositories.fractionalsRepository.list({
                filters: { fractionalIds: rulesFractionalIds },
                pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
              }),
            ),
            listWhenIdsPresent(environmentIds, () =>
              repositories.environmentsRepository.list({
                filters: { environmentIds },
                pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
              }),
            ),
          ]);
        const segmentKeyById = new Map(segmentsResult.map((segment) => [segment.id, segment.key]));
        const fractionalsById = new Map(fractionalsResult.map((fractional) => [fractional.id, fractional]));
        const featureFlagsById = new Map(featureFlagsResult.map((flag) => [flag.id, flag]));
        const applicationNamesByApplicationId = new Map(applicationsResult.map((app) => [app.id, app.name]));
        const environmentKeyById = new Map(environmentsResult.map((env) => [env.id, env.key]));
        // A soft-deleted variation can still be a flag environment's default serve; flagd needs a
        // resolvable key and a matching variant entry for it or the flag can't be evaluated.
        const orphanedDefaultServeIds = collectOrphanedDefaultServeIds(flagEnvironmentsResult, flagVariationsResult);
        const orphanedDefaultServes = await listWhenIdsPresent(orphanedDefaultServeIds, () =>
          repositories.flagVariationsRepository.list({
            filters: { ids: orphanedDefaultServeIds, include: { deleted: true } },
            pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
          }),
        );
        const { variationsByVariationId, variationMapByFlagId, variationsByIdKey } = collectVariationIndexes([
          ...flagVariationsResult,
          ...orphanedDefaultServes,
        ]);
        const $evaluators = generateEvaluators(
          rulesBySegmentId,
          segmentsResult,
          applicationNamesByApplicationId,
          environmentKeyById,
        );
        const targetingByFlagEnvironment = generateTargeting(
          flagEnvironmentsResult,
          featureFlagsById,
          rulesByFlagEnvironment,
          variationsByIdKey,
          fractionalsById,
          applicationNamesByApplicationId,
          environmentKeyById,
          segmentKeyById,
        );
        const variantsByFlagId = generateVariants(featureFlagsResult, variationMapByFlagId);
        const flags = formatFlags(
          flagEnvironmentsResult,
          targetingByFlagEnvironment,
          variantsByFlagId,
          variationsByVariationId,
          featureFlagsById,
          applicationNamesByApplicationId,
          environmentKeyById,
        );

        return {
          flags,
          $evaluators,
        };
      } catch (error) {
        throw new InternalError({ message: 'Failed to build flagd configuration', cause: error });
      }
    },
  };
}

function collectRuleIndexes(rules: RulesListItem[]) {
  const [rulesSegmentIdSet, rulesFractionalIdSet, rulesBySegmentId, rulesByFlagEnvironment] = rules.reduce<
    [Set<string>, Set<string>, Map<string, RulesListItem[]>, Map<string, RulesListItem[]>]
  >(
    (acc, rule) => {
      if (rule.segmentId) {
        acc[0].add(rule.segmentId);
        const segmentRules = acc[2].get(rule.segmentId);

        if (segmentRules) {
          segmentRules.push(rule);
        } else {
          acc[2].set(rule.segmentId, [rule]);
        }
      }

      if (rule.serveFractionalId) {
        acc[1].add(rule.serveFractionalId);
      }

      if (rule.flagId && rule.environmentId) {
        const flagEnvironmentKey = propertyReference(rule.flagId, rule.environmentId);
        const flagRules = acc[3].get(flagEnvironmentKey);

        if (flagRules) {
          flagRules.push(rule);
        } else {
          acc[3].set(flagEnvironmentKey, [rule]);
        }
      }

      return acc;
    },
    [new Set(), new Set(), new Map(), new Map()],
  );

  return {
    rulesSegmentIds: [...rulesSegmentIdSet],
    rulesFractionalIds: [...rulesFractionalIdSet],
    rulesBySegmentId,
    rulesByFlagEnvironment,
  };
}

function collectFlagEnvironmentIds(flagEnvironments: FlagEnvironmentsSelect[]) {
  const environmentIdSet = flagEnvironments.reduce<Set<string>>((accumulator, flagEnvironment) => {
    accumulator.add(flagEnvironment.environmentId);

    return accumulator;
  }, new Set());

  return {
    environmentIds: [...environmentIdSet],
  };
}

function collectOrphanedDefaultServeIds(
  flagEnvironments: FlagEnvironmentsSelect[],
  variations: FlagVariationsSelect[],
) {
  const knownVariationIds = new Set(variations.map((variation) => variation.id));

  return [
    ...new Set(
      flagEnvironments
        .map((flagEnvironment) => flagEnvironment.defaultServeId)
        .filter((id) => !knownVariationIds.has(id)),
    ),
  ];
}

function collectVariationIndexes(variations: FlagVariationsSelect[]) {
  const [variationsByVariationId, variationMapByFlagId, variationsByIdKey] = variations.reduce<
    [Map<string, FlagVariationsSelect>, Map<string, FeatureFlagVariation<FeatureFlagType>>, Map<string, string>]
  >(
    (accumulator, variation) => {
      accumulator[0].set(variation.id, variation);
      accumulator[2].set(variation.id, variation.key);

      const variationMap = accumulator[1].get(variation.flagId);

      if (variationMap) {
        variationMap[variation.key] = variation.value;
      } else {
        accumulator[1].set(variation.flagId, {
          [variation.key]: variation.value,
        } as FeatureFlagVariation<FeatureFlagType>);
      }

      return accumulator;
    },
    [new Map(), new Map(), new Map()],
  );

  return {
    variationsByVariationId,
    variationMapByFlagId,
    variationsByIdKey,
  };
}

function getApplicationNameForFlag(
  flagId: string,
  featureFlagsById: Map<string, FeatureFlagsSelect>,
  applicationNamesByApplicationId: Map<string, string>,
) {
  const featureFlag = featureFlagsById.get(flagId);

  if (!featureFlag?.applicationId) {
    return '';
  }

  return applicationNamesByApplicationId.get(featureFlag.applicationId) ?? '';
}

function generateEvaluators(
  rulesBySegmentId: Map<string, RulesListItem[]>,
  segments: SegmentsSelect[],
  applicationsById: Map<string, string>,
  environmentKeyById: Map<string, string>,
) {
  const $evaluators = segments.reduce((evaluators, segment) => {
    const segmentRules = rulesBySegmentId.get(segment.id) ?? [];

    segmentRules.forEach((segmentRule) => {
      if (segmentRule?.conditions?.length) {
        const environmentKey = environmentKeyById.get(segmentRule.environmentId);
        const application = applicationsById.get(segment.applicationId);
        const applicationName = application ?? segment.applicationId;

        Object.assign(
          evaluators,
          segmentToFlagdEvaluator(
            segment.key,
            segmentRule.conditions as ContextRuleCondition[],
            applicationName,
            environmentKey,
          ),
        );
      }
    });

    return evaluators;
  }, {});

  return $evaluators;
}

function generateTargeting(
  flagEnvironments: FlagEnvironmentsSelect[],
  featureFlagsById: Map<string, FeatureFlagsSelect>,
  rulesByFlagEnvironment: Map<string, RulesListItem[]>,
  variationsById: Map<string, string>,
  fractionalsById: Map<string, FractionalsSelect>,
  applicationNamesByApplicationId: Map<string, string>,
  environmentKeyById: Map<string, string>,
  segmentKeyById: Map<string, string>,
) {
  return new Map(
    flagEnvironments.map((flagEnvironment) => {
      const environmentKey = environmentKeyById.get(flagEnvironment.environmentId) as EnvironmentKey;
      const applicationName = getApplicationNameForFlag(
        flagEnvironment.flagId,
        featureFlagsById,
        applicationNamesByApplicationId,
      );
      const flagRules =
        rulesByFlagEnvironment.get(propertyReference(flagEnvironment.flagId, flagEnvironment.environmentId)) ?? [];
      const targeting = flagRules.flatMap((rule) => {
        const conditions = resolveSegmentConditions(rule.conditions, segmentKeyById);

        if (rule.serveFractionalId) {
          const ruleFractional = fractionalsById.get(rule.serveFractionalId);
          const fractional = ruleFractional
            ? fractionalWeightsWithVariationKeys(variationsById, {
                id: ruleFractional.id,
                var: ruleFractional.var,
                type: ruleFractional.type,
                weights: ruleFractional.weights,
              })
            : null;

          return ruleToFlagdTarget(conditions, fractional, RuleServeType.Fractional, applicationName, environmentKey);
        }

        return ruleToFlagdTarget(
          conditions,
          rule.serveVariationKey,
          RuleServeType.Variation,
          applicationName,
          environmentKey,
        );
      });

      return [propertyReference(flagEnvironment.flagId, flagEnvironment.environmentId), targeting];
    }),
  );
}

function generateVariants(
  featureFlags: FeatureFlagsSelect[],
  variationsByFlagId: Map<string, FeatureFlagVariation<FeatureFlagType>>,
) {
  return new Map(
    featureFlags.map((flag) => {
      const variationMap = variationsByFlagId.get(flag.id) ?? ({} as FeatureFlagVariation<FeatureFlagType>);

      return [flag.id, featureFlagVariantsBasedOnFeatureFlagType(variationMap, flag.type)];
    }),
  );
}

function formatFlags(
  flagEnvironments: FlagEnvironmentsSelect[],
  targetingByFlagEnvironment: Map<string, FlagdTargeting[]>,
  variantsByFlagId: Map<string, Record<string, unknown>>,
  variationsById: Map<string, FlagVariationsSelect>,
  featureFlagsById: Map<string, FeatureFlagsSelect>,
  applicationNamesByApplicationId: Map<string, string>,
  environmentKeyById: Map<string, string>,
) {
  return flagEnvironments.map((flagEnvironment) => {
    const environmentKey = environmentKeyById.get(flagEnvironment.environmentId);
    const featureFlag = featureFlagsById.get(flagEnvironment.flagId);
    const applicationName = getApplicationNameForFlag(
      flagEnvironment.flagId,
      featureFlagsById,
      applicationNamesByApplicationId,
    );
    const targeting =
      targetingByFlagEnvironment.get(propertyReference(flagEnvironment.flagId, flagEnvironment.environmentId)) ?? [];
    const variants = variantsByFlagId.get(flagEnvironment.flagId) ?? {};
    const flagVariation = variationsById.get(flagEnvironment.defaultServeId);
    const defaultVariant = flagVariation?.key ?? flagEnvironment.defaultServeId;
    const state = flagEnvironment.enabled && !featureFlag?.archived ? 'ENABLED' : 'DISABLED';
    const flagBase = {
      defaultVariant,
      key: featureFlag?.key,
      state,
      targeting: targeting.length ? { if: targeting } : {},
      variants,
    };

    return {
      ...flagBase,
      metadata: {
        flagSetId: `${applicationName}-${environmentKey}`,
      },
    };
  });
}

/**
 * Resolves segment conditions to a flagd compatible format with segmentKey.
 */
function resolveSegmentConditions(
  conditions: RulesListItem['conditions'],
  segmentKeyById: Map<string, string>,
): (ContextRuleCondition | TimeRuleCondition | ResolvedSegmentRuleCondition)[] {
  return conditions.map((condition) => {
    if (condition.type === RuleConditionType.Segment) {
      const segmentKey = segmentKeyById.get(condition.segmentId) ?? '';
      return {
        clause: condition.clause,
        operator: condition.operator,
        segmentKey,
      };
    }

    return condition;
  });
}

function listWhenIdsPresent<T>(ids: string[], query: () => Promise<T[]>) {
  if (!ids.length) {
    return Promise.resolve([]);
  }

  return query();
}

export default createFlagdService;
