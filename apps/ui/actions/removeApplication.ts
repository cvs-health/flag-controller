// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { z } from 'zod';

import { type ActionState, ActionStatus } from '../typings/common';
import deleteApplication from '../api/requests/deleteApplication';
import { actionErrorsFrom } from '../utils/actionErrorsFrom';

interface RemoveApplicationFormState {
  applicationName: string;
  applicationId: string;
}

export type RemoveApplicationActionState = ActionState<RemoveApplicationFormState>;

async function removeApplication(
  prevState: RemoveApplicationActionState,
  formData: FormData,
): Promise<RemoveApplicationActionState> {
  const schema = z.object({
    applicationName: z.string().min(1, 'You must select an application.'),
    applicationId: z.string().min(1, 'You must select an application.'),
  });
  const validatedFields = schema.safeParse({
    applicationName: formData.get('applicationName'),
    applicationId: formData.get('applicationId') || '',
  });
  const formDataEntries = Object.fromEntries(formData.entries()) as unknown as RemoveApplicationFormState;

  if (!validatedFields.success) {
    return {
      ...prevState,
      form: formDataEntries,
      errors: z.flattenError(validatedFields.error),
      status: ActionStatus.Error,
    };
  }

  try {
    await deleteApplication({ applicationId: validatedFields.data.applicationId });

    return {
      form: validatedFields.data,
      status: ActionStatus.Success,
    };
  } catch (error) {
    return {
      ...prevState,
      form: formDataEntries,
      errors: actionErrorsFrom<RemoveApplicationFormState>(error, { title: 'Failed to remove application' }),
      status: ActionStatus.Error,
    };
  }
}

export default removeApplication;
