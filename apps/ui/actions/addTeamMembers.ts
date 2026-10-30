// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { z } from 'zod';

import { type ActionState, ActionStatus } from '../typings/common';
import { actionErrorsFrom } from '../utils/actionErrorsFrom';
import postTeamMembers from '../api/requests/postTeamMembers';

interface AddTeamMembersFormState {
  memberIds: string[];
  teamId: string;
}

export type AddTeamMembersActionState = ActionState<AddTeamMembersFormState>;

async function addTeamMembers(
  prevState: AddTeamMembersActionState,
  formData: FormData,
): Promise<AddTeamMembersActionState> {
  try {
    const rawMemberIds = JSON.parse((formData.get('memberIds') as string) || '[]') as string[];
    const teamId = formData.get('teamId') as string;

    const schema = z.object({
      memberIds: z.array(z.string()).min(1, 'You must add a member.'),
      teamId: z.string().min(1),
    });

    const validatedFields = schema.safeParse({ memberIds: rawMemberIds, teamId });

    if (!validatedFields.success) {
      return {
        ...prevState,
        form: { memberIds: rawMemberIds, teamId },
        errors: z.flattenError(validatedFields.error),
        status: ActionStatus.Error,
      };
    }

    const requestPayload = {
      teamId: validatedFields.data.teamId,
      body: validatedFields.data.memberIds,
    };

    await postTeamMembers(requestPayload);

    return {
      ...prevState,
      errors: undefined,
      form: validatedFields.data,
      status: ActionStatus.Success,
    };
  } catch (error) {
    return {
      ...prevState,
      errors: actionErrorsFrom(error, { title: 'Failed to add team members' }),
      status: ActionStatus.Error,
    };
  }
}

export default addTeamMembers;
