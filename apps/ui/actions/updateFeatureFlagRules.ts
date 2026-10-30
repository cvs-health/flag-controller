// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import type { RulesJoined } from 'shared-types';

import deleteRules from '../api/requests/deleteRules';
import featureFlagRulesFormDataToRules, { type ParsedFeatureFlagRule } from '../utils/featureFlagRulesFormDataToRules';
import getSettledRequestErrorMessage from '../utils/getSettledRequestErrorMessage';
import groupRulesByChange from '../utils/groupRulesByChange';
import patchFeatureFlagEnvironment from '../api/requests/patchFeatureFlagEnvironment';
import patchRules from '../api/requests/patchRules';
import postRules from '../api/requests/postRules';
import { ActionStatus } from '../typings/common';
import { actionErrorsFrom } from '../utils/actionErrorsFrom';

interface Data {
  [key: string]: string;
  applicationName: string;
  defaultVariationId: string;
  description: string;
  environmentKey: string;
  featureFlagKey: string;
  rules: string;
  segmentKey: string;
}
interface UpdateFeatureFlagRulesState {
  errorMessage: string;
  form: Partial<Data>;
  status: ActionStatus;
}

async function updateFeatureFlagRules(state: UpdateFeatureFlagRulesState, formData: FormData | undefined) {
  // Invoking the form action without formData means the status should reset
  if (!formData) {
    return {
      ...state,
      status: ActionStatus.Idle,
    };
  }

  const rules = featureFlagRulesFormDataToRules(formData);
  const rulesWithRemovedConditionId: ParsedFeatureFlagRule[] = rules.map((rule) => ({
    ...rule,
    conditions: rule.conditions.map((condition) => {
      const { id, ...rest } = condition;
      return rest;
    }),
  }));
  const existingRules = JSON.parse(formData.get('rules') as string) as RulesJoined[];
  const [newRules, modifiedRules, deletedRules] = groupRulesByChange(rulesWithRemovedConditionId, existingRules);
  const rawFormData = Object.fromEntries(formData) as unknown as Data;

  try {
    const calls = [];

    if (newRules.length) {
      calls.push(postRules(newRules));
    }

    if (deletedRules.length) {
      const deleteRulesRequestPayload = deletedRules.map((rule) => rule.id);

      calls.push(deleteRules(deleteRulesRequestPayload));
    }

    if (modifiedRules.length) {
      calls.push(patchRules(modifiedRules));
    }

    // If the default variation has changed, we need to patch the feature flag
    if (rawFormData.defaultVariationId !== rawFormData['defaultVariationId-existing']) {
      const patchFeatureFlagRequestPayload = {
        environmentId: rawFormData.environmentId as string,
        featureFlagId: rawFormData.flagId as string,
        body: {
          defaultServeId: rawFormData.defaultVariationId,
        },
      };

      calls.push(patchFeatureFlagEnvironment(patchFeatureFlagRequestPayload));
    }

    if (calls.length) {
      const results = await Promise.allSettled(calls);
      const errorMessages = getSettledRequestErrorMessage(results);

      if (errorMessages.length) {
        return {
          errorMessage: errorMessages.join('; '),
          form: rawFormData,
          status: ActionStatus.Error,
        };
      }
    }

    return {
      errorMessage: '',
      form: rawFormData,
      status: ActionStatus.Success,
    };
  } catch (error) {
    return {
      errorMessage: actionErrorsFrom(error, { title: 'Failed' }).actionError?.subtitle ?? '',
      form: rawFormData,
      status: ActionStatus.Error,
    };
  }
}

export default updateFeatureFlagRules;
