// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';
import type { FeatureFlagType } from 'shared-types';

import deleteVariations from '../api/requests/deleteVariations';
import featureFlagVariationsFormDataToVariations from '../utils/featureFlagVariationsFormDataToVariations';
import groupVariationsByChange from '../utils/groupVariationsByChange';
import patchVariations from '../api/requests/patchVariations';
import postVariations from '../api/requests/postVariations';
import type { Variation } from '../typings/variations';
import { FormAction, ActionStatus } from '../typings/common';
import { actionErrorsFrom } from '../utils/actionErrorsFrom';

interface Data {
  featureFlagId: string;
  featureFlagType: FeatureFlagType;
}
interface UpdateFeatureFlagVariationsState {
  errorMessage: string;
  status: ActionStatus;
}

async function updateFeatureFlagVariations(
  prevState: UpdateFeatureFlagVariationsState,
  formData: FormData | FormAction,
) {
  if (formData instanceof FormData) {
    const rawFormData = Object.fromEntries(formData) as unknown as Data;
    const variations = featureFlagVariationsFormDataToVariations(formData, rawFormData.featureFlagType);
    const existingVariations = JSON.parse((formData.get('variations') as string) || '[]') as Variation[];
    const [createdVariations, modifiedVariations, removedVariations] = groupVariationsByChange(
      variations,
      existingVariations,
    );

    try {
      const calls = [];

      if (createdVariations.length) {
        const postVariationsPayload = createdVariations.map((variation) => ({
          ...variation,
          flagId: rawFormData.featureFlagId,
        }));

        calls.push(postVariations(postVariationsPayload));
      }

      if (removedVariations.length) {
        calls.push(deleteVariations(removedVariations));
      }

      if (modifiedVariations.length) {
        calls.push(patchVariations(modifiedVariations));
      }

      if (calls.length) {
        await Promise.all(calls);
      }

      return {
        errorMessage: '',
        status: ActionStatus.Success,
      };
    } catch (error) {
      return {
        ...prevState,
        errorMessage: actionErrorsFrom(error, { title: 'Failed' }).actionError?.subtitle ?? '',
        status: ActionStatus.Error,
      };
    }
  }

  if (formData === FormAction.ResetStatus) {
    return {
      ...prevState,
      status: ActionStatus.Idle,
    };
  }

  return prevState;
}

export default updateFeatureFlagVariations;
