// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { z } from 'zod';

import deleteTeam from '../api/requests/deleteTeam';
import withSessionAction from './withSessionAction';
import { type ActionState, ActionStatus, type AuthSession } from '../typings/common';
import { actionErrorsFrom } from '../utils/actionErrorsFrom';

interface RemoveTeamFormState {
  teamName: string;
  teamId: string;
}

export type RemoveTeamActionState = ActionState<RemoveTeamFormState>;

async function removeTeam(
  prevState: RemoveTeamActionState,
  formData: FormData,
  _session: NonNullable<AuthSession>,
): Promise<RemoveTeamActionState> {
  const formDataEntries = Object.fromEntries(formData.entries()) as unknown as RemoveTeamFormState;

  const schema = z.object({
    teamName: z.string().min(1),
    teamId: z.string().min(1, 'Team id is required.'),
  });

  const validatedFields = schema.safeParse(formDataEntries);

  if (!validatedFields.success) {
    return {
      ...prevState,
      form: formDataEntries,
      errors: z.flattenError(validatedFields.error),
      status: ActionStatus.Error,
    };
  }

  try {
    await deleteTeam(formDataEntries.teamId);
  } catch (error) {
    return {
      ...prevState,
      form: formDataEntries,
      errors: actionErrorsFrom(error, { title: 'Failed to remove team' }),
      status: ActionStatus.Error,
    };
  }

  return {
    form: formDataEntries,
    status: ActionStatus.Success,
  };
}

export default withSessionAction(removeTeam);
