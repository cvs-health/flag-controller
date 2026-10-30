// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  type CreateFractional,
  FractionalType,
  RuleServeType,
  type RulesTableColumns,
  type UpdateFractional,
  type FractionalWeight,
  RulesServeAction,
} from 'shared-types';

import { WEIGHTED_ROLLOUT_ID } from '../constants/rules';
import { getRuleConditionsFromFormData } from './getRuleConditionsFromFormData';

interface BaseFormDataRule {
  created: boolean;
  id: string;
  removed: boolean;
  serve: UpdateFractional | CreateFractional | null;
}

export type ParsedFeatureFlagRule = Omit<
  RulesTableColumns,
  'deletedAt' | 'createdAt' | 'updatedAt' | 'segmentId' | 'id'
> &
  BaseFormDataRule;

export function parseFeatureFlagRule(formData: FormData, key: string, index: number) {
  const environmentId = formData.get('environmentId') as string;
  const flagId = formData.get('flagId') as string;
  const ruleRemoved = formData.getAll('removed')[index] === 'true';
  const ruleId = formData.getAll('id')[index] as string;

  if (ruleRemoved) {
    return {
      conditions: [],
      environmentId,
      flagId,
      id: ruleId,
      key,
      created: false,
      orderPosition: index,
      removed: true,
      serveVariationId: null,
      serveFractionalId: null,
      serve: null,
    };
  }

  const ruleConditionIds = formData.getAll(`${ruleId}-conditionId`) as string[];
  const ruleServeType = formData.getAll('serveType')[index] as RuleServeType;
  const weights: FractionalWeight[] = [];
  const serveId = formData.getAll('serveId')[index] as string;
  const serveVariationId = ruleServeType === RuleServeType.Variation ? serveId || null : null;
  const serveFractionalId =
    ruleServeType === RuleServeType.Fractional && serveId !== WEIGHTED_ROLLOUT_ID ? serveId || null : null;
  const conditions = getRuleConditionsFromFormData(formData, ruleConditionIds);
  let serve: UpdateFractional | CreateFractional | null = null;

  if (ruleServeType === RuleServeType.Fractional) {
    [...formData.entries()].forEach(([formInputName, value]) => {
      if (formInputName.startsWith(`${index}-rule-rollout-variation-`)) {
        const [, variationId = ''] = formInputName.split('rule-rollout-variation-');

        weights.push([variationId, Number(value)]);
      }
    });
    const attribute = formData.get(`${index}-rule-rollout-attribute`) || '';
    const context = formData.get(`${index}-rule-rollout-context`) || '';
    const fractionalBase = {
      type: RuleServeType.Fractional,
      value: {
        var: `${context}${attribute ? `.${attribute}` : ''}`,
        type: FractionalType.Contextual,
        weights,
      },
    };

    serve = serveFractionalId
      ? ({ ...fractionalBase, id: serveFractionalId, action: RulesServeAction.Update } as UpdateFractional)
      : ({ ...fractionalBase, action: RulesServeAction.Create } as CreateFractional);
  }

  return {
    conditions,
    environmentId,
    flagId,
    id: ruleId,
    key,
    created: formData.getAll('created')[index] === 'true',
    orderPosition: index,
    removed: false,
    serveVariationId,
    serveFractionalId,
    serve,
  };
}
