// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { z } from 'zod';

import postFeatureFlag from '../api/requests/postFeatureFlag';
import { createFeatureFlagSchema, type CreateFeatureFlagForm } from '../schemas/createFeatureFlag';
import { type ActionState, ActionStatus } from '../typings/common';
import { actionErrorsFrom } from '../utils/actionErrorsFrom';
import featureFlagVariationsFromFormData from '../utils/featureFlagVariationsFromFormData';

export type CreateFeatureFlagActionState = ActionState<CreateFeatureFlagForm>;

async function createFeatureFlag(
  prevState: CreateFeatureFlagActionState,
  formData: FormData,
): Promise<CreateFeatureFlagActionState> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = createFeatureFlagSchema.safeParse({
    applicationId: rawFormData.applicationId,
    defaultVariationKey: rawFormData.defaultVariationKey,
    description: rawFormData.description,
    key: rawFormData.key,
    type: rawFormData.type,
    variationKey1: rawFormData.variationKey1,
    variationKey2: rawFormData.variationKey2,
    variationValue1: rawFormData.variationValue1,
    variationValue2: rawFormData.variationValue2,
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      form: rawFormData as CreateFeatureFlagForm,
      errors: z.flattenError(validatedFields.error),
      status: ActionStatus.Error,
    };
  }

  const parsedFormData = validatedFields.data;

  try {
    const variations = featureFlagVariationsFromFormData(
      {
        [parsedFormData.variationKey1]: parsedFormData.variationValue1,
        [parsedFormData.variationKey2]: parsedFormData.variationValue2,
      },
      parsedFormData.type,
    );

    const requestPayload = {
      applicationId: parsedFormData.applicationId,
      body: {
        defaultVariationKey: parsedFormData.defaultVariationKey,
        description: parsedFormData.description,
        enabled: false,
        key: parsedFormData.key,
        type: parsedFormData.type,
        variations: variations,
      },
    };

    await postFeatureFlag(requestPayload);

    return {
      form: parsedFormData,
      status: ActionStatus.Success,
    };
  } catch (error) {
    return {
      ...prevState,
      form: parsedFormData,
      errors: actionErrorsFrom<CreateFeatureFlagForm>(error, { title: 'System error' }),
      status: ActionStatus.Error,
    };
  }
}

export default createFeatureFlag;
