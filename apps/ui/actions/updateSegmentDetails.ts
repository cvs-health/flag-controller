// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { z } from 'zod';

import patchSegment from '../api/requests/patchSegment';
import { updateSegmentDetailsSchema, type UpdateSegmentDetailsForm } from '../schemas/updateDetails';
import { type ActionState, ActionStatus } from '../typings/common';
import { actionErrorsFrom } from '../utils/actionErrorsFrom';

export type UpdateSegmentDetailsState = ActionState<UpdateSegmentDetailsForm>;

async function updateSegmentDetails(
  prevState: UpdateSegmentDetailsState,
  formData?: FormData,
): Promise<UpdateSegmentDetailsState> {
  // Invoking the form action without formData means the status should reset
  if (!formData) {
    return {
      ...prevState,
      status: ActionStatus.Idle,
    };
  }

  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = updateSegmentDetailsSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      ...prevState,
      form: rawFormData as UpdateSegmentDetailsForm,
      errors: z.flattenError(validatedFields.error),
      status: ActionStatus.Error,
    };
  }

  const parsedFormData = validatedFields.data;
  const requestPayload = {
    segmentId: parsedFormData.segmentId,
    body: {
      description: parsedFormData.description,
    },
  };

  try {
    await patchSegment(requestPayload);

    return {
      form: parsedFormData,
      status: ActionStatus.Success,
    };
  } catch (error) {
    return {
      ...prevState,
      form: parsedFormData,
      errors: actionErrorsFrom<UpdateSegmentDetailsForm>(error, { title: 'System error' }),
      status: ActionStatus.Error,
    };
  }
}

export default updateSegmentDetails;
