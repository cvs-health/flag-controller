// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import getSession from '../api/requests/getSession';
import { type ActionState, ActionStatus, type AuthSession } from '../typings/common';

// Wraps a server action and provides authenticated session fields (for example `activeOrganizationId`) without
// duplicating auth checks in every action.
function withSessionAction<S extends ActionState>(
  serverAction: (prevState: S, formData: FormData, session: NonNullable<AuthSession>) => Promise<S>,
) {
  return async (prevState: S, formData: FormData) => {
    const session = await getSession();
    const formDataEntries = Object.fromEntries(formData.entries()) as unknown as S['form'];

    if (!session) {
      return {
        ...prevState,
        form: formDataEntries,
        errors: {
          actionError: {
            title: 'Unauthorized',
            subtitle: 'You must be signed in.',
          },
        },
        status: ActionStatus.Error,
      };
    }

    return serverAction(prevState, formData, session);
  };
}

export default withSessionAction;
