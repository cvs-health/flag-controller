// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { z } from 'zod';

import getBetterAuthHeaders from './getBetterAuthHeaders';
import withSessionAction from './withSessionAction';
import { authClient } from '../lib/auth-client';
import { createTeamSchema, type CreateTeamForm } from '../schemas/createTeam';
import { type ActionState, ActionStatus, type AuthSession, type BetterAuthFetchError } from '../typings/common';

export type CreateTeamActionState = ActionState<CreateTeamForm>;

async function createTeam(
  prevState: CreateTeamActionState,
  formData: FormData,
  session: NonNullable<AuthSession>,
): Promise<CreateTeamActionState> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = createTeamSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      ...prevState,
      form: rawFormData as CreateTeamForm,
      errors: z.flattenError(validatedFields.error),
      status: ActionStatus.Error,
    };
  }

  const parsedFormData = validatedFields.data;
  const headers = await getBetterAuthHeaders();
  const result = await authClient.organization.createTeam(
    {
      name: parsedFormData.teamName,
      organizationId: session.session.activeOrganizationId || '',
    },
    {
      headers,
    },
  );

  if (result.error) {
    return {
      ...prevState,
      form: parsedFormData,
      errors: createTeamErrorToActionError(result.error),
      status: ActionStatus.Error,
    };
  }

  return {
    form: parsedFormData,
    status: ActionStatus.Success,
  };
}

function createTeamErrorToActionError(error: BetterAuthFetchError) {
  if (error.status === 401) {
    return {
      actionError: {
        title: 'Failed to create',
        subtitle: 'You do not have permission to create a team.',
      },
    };
  }

  return {
    actionError: {
      title: 'System error',
      subtitle: 'Failed to create a team. Please try again later.',
    },
  };
}

export default withSessionAction(createTeam);
