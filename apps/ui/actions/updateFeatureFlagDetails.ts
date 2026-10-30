// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { z } from 'zod';

import patchFeatureFlag from '../api/requests/patchFeatureFlag';
import { updateFeatureFlagDetailsSchema, type UpdateFeatureFlagDetailsForm } from '../schemas/updateDetails';
import { type ActionState, ActionStatus } from '../typings/common';
import { actionErrorsFrom } from '../utils/actionErrorsFrom';

export type UpdateFeatureFlagDetailsState = ActionState<UpdateFeatureFlagDetailsForm>;

async function updateFeatureFlagDetails(
  prevState: UpdateFeatureFlagDetailsState,
  formData?: FormData,
): Promise<UpdateFeatureFlagDetailsState> {
  // Invoking the form action without formData means the status should reset
  if (!formData) {
    return {
      ...prevState,
      status: ActionStatus.Idle,
    };
  }

  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = updateFeatureFlagDetailsSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      ...prevState,
      form: rawFormData as UpdateFeatureFlagDetailsForm,
      errors: z.flattenError(validatedFields.error),
      status: ActionStatus.Error,
    };
  }

  const parsedFormData = validatedFields.data;
  const requestPayload = {
    featureFlagId: parsedFormData.featureFlagId,
    body: {
      description: parsedFormData.description,
      archived: false,
    },
  };

  try {
    await patchFeatureFlag(requestPayload);

    return {
      form: parsedFormData,
      status: ActionStatus.Success,
    };
  } catch (error) {
    return {
      ...prevState,
      form: parsedFormData,
      errors: actionErrorsFrom<UpdateFeatureFlagDetailsForm>(error, { title: 'System error' }),
      status: ActionStatus.Error,
    };
  }
}

export default updateFeatureFlagDetails;
