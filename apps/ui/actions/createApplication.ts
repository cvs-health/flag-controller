// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { z } from 'zod';

import { type ActionState, ActionStatus } from '../typings/common';
import postApplication from '../api/requests/postApplication';
import { createApplicationSchema, type CreateApplicationForm } from '../schemas/createApplication';
import { actionErrorsFrom } from '../utils/actionErrorsFrom';

// The API names the field `name`; the form calls it `applicationName`.
const API_FIELD_TO_FORM: Record<string, keyof CreateApplicationForm> = { name: 'applicationName' };

export type CreateApplicationActionState = ActionState<CreateApplicationForm>;

async function createApplication(
  prevState: CreateApplicationActionState,
  formData: FormData,
): Promise<CreateApplicationActionState> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = createApplicationSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      ...prevState,
      form: rawFormData as CreateApplicationForm,
      errors: z.flattenError(validatedFields.error),
      status: ActionStatus.Error,
    };
  }

  const parsedFormData = validatedFields.data;

  try {
    const requestPayload = {
      name: parsedFormData.applicationName,
      teamId: parsedFormData.teamId,
    };

    await postApplication(requestPayload);

    return {
      form: parsedFormData,
      status: ActionStatus.Success,
    };
  } catch (error) {
    return {
      ...prevState,
      form: parsedFormData,
      errors: actionErrorsFrom<CreateApplicationForm>(
        error,
        { title: 'Failed to create application' },
        API_FIELD_TO_FORM,
      ),
      status: ActionStatus.Error,
    };
  }
}

export default createApplication;
