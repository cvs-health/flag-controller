// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { z } from 'zod';

import postSegments from '../api/requests/postSegments';
import { createSegmentSchema, type CreateSegmentForm } from '../schemas/createSegment';
import { type ActionState, ActionStatus } from '../typings/common';
import { actionErrorsFrom } from '../utils/actionErrorsFrom';

export type CreateSegmentActionState = ActionState<CreateSegmentForm>;

async function createSegment(
  prevState: CreateSegmentActionState,
  formData: FormData,
): Promise<CreateSegmentActionState> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = createSegmentSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      ...prevState,
      form: rawFormData as CreateSegmentForm,
      errors: z.flattenError(validatedFields.error),
      status: ActionStatus.Error,
    };
  }

  const parsedFormData = validatedFields.data;

  try {
    await postSegments([parsedFormData]);

    return {
      form: parsedFormData,
      status: ActionStatus.Success,
    };
  } catch (error) {
    return {
      ...prevState,
      form: parsedFormData,
      errors: actionErrorsFrom<CreateSegmentForm>(error, { title: 'System error' }),
      status: ActionStatus.Error,
    };
  }
}

export default createSegment;
