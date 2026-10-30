// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { z } from 'zod';

import { ActionStatus, type ActionState } from '../typings/common';
import { actionErrorsFrom } from '../utils/actionErrorsFrom';
import deleteTeamMember from '../api/requests/deleteTeamMember';

interface RemoveTeamMemberFormState {
  teamId: string;
  userId: string;
}

export type RemoveTeamMemberActionState = ActionState<RemoveTeamMemberFormState>;

async function removeTeamMember(
  prevState: RemoveTeamMemberActionState,
  formData: FormData,
): Promise<RemoveTeamMemberActionState> {
  try {
    const userId = formData.get('userId') as string;
    const teamId = formData.get('teamId') as string;

    const schema = z.object({
      userId: z.string().min(1),
      teamId: z.string().min(1),
    });

    const validatedFields = schema.safeParse({ userId, teamId });

    if (!validatedFields.success) {
      return {
        ...prevState,
        form: { userId, teamId },
        errors: z.flattenError(validatedFields.error),
        status: ActionStatus.Error,
      };
    }
    const requestPayload = {
      teamId: validatedFields.data.teamId,
      userId: validatedFields.data.userId,
    };

    await deleteTeamMember(requestPayload);

    return {
      ...prevState,
      form: validatedFields.data,
      status: ActionStatus.Success,
    };
  } catch (error) {
    return {
      ...prevState,
      errors: actionErrorsFrom(error, { title: 'Failed to remove team member' }),
      status: ActionStatus.Error,
    };
  }
}

export default removeTeamMember;
