// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { isEqual } from 'es-toolkit/predicate';
import type { RulesJoined } from 'shared-types';

import patchRules from '../api/requests/patchRules';
import postRules from '../api/requests/postRules';
import getSettledRequestErrorMessage from '../utils/getSettledRequestErrorMessage';
import segmentRulesFormDataToRules from '../utils/segmentRulesFormDataToRules';
import { ActionStatus } from '../typings/common';
import { actionErrorsFrom } from '../utils/actionErrorsFrom';

export interface UpdateSegmentRulesReturn {
  errorMessage: string;
  status: ActionStatus;
}

export interface UpdateSegmentRulesState {
  [key: string]: string;
  environmentId: string;
  segmentId: string;
  rules: string;
}

async function updateSegmentRules(_prevState: UpdateSegmentRulesState | UpdateSegmentRulesReturn, formData: FormData) {
  const rawFormData = Object.fromEntries(formData) as unknown as UpdateSegmentRulesState;
  const [existingRule] = JSON.parse(rawFormData.rules) as RulesJoined[];
  const [rule] = segmentRulesFormDataToRules(formData);

  try {
    const calls = [];

    if (rule?.created) {
      calls.push(
        postRules([
          {
            conditions: rule.conditions,
            environmentId: rule.environmentId,
            key: rule.key,
            orderPosition: rule.orderPosition,
            segmentId: rule.segmentId,
          },
        ]),
      );
    } else if (rule && !isEqual(rule.conditions, existingRule?.conditions)) {
      calls.push(patchRules([{ id: rule.id, conditions: rule.conditions }]));
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

export default updateSegmentRules;
