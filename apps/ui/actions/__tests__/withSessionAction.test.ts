// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import withSessionAction from '../withSessionAction';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import { ActionStatus } from '../../typings/common';

describe('withSessionAction', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const initialState = {
    form: {
      teamName: '',
    },
    status: ActionStatus.Idle,
  };

  const session = {
    session: {
      activeOrganizationId: 'org-1',
    },
  };

  it('calls wrapped server action when session exists', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(session));

    const formData = new FormData();
    formData.append('teamName', 'my-team');

    const wrappedResult = {
      form: {
        teamName: 'my-team',
      },
      status: ActionStatus.Success,
    };

    const serverAction = vi.fn(async () => wrappedResult);
    const action = withSessionAction(serverAction);

    const result = await action(initialState, formData);

    expect(serverAction).toHaveBeenCalledExactlyOnceWith(initialState, formData, session);
    expect(result).toEqual(wrappedResult);
  });

  it('returns unauthorized error when session does not exist', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(null));

    const formData = new FormData();
    formData.append('teamName', 'my-team');

    const serverAction = vi.fn(async () => ({
      form: {
        teamName: 'my-team',
      },
      status: ActionStatus.Success,
    }));
    const action = withSessionAction(serverAction);

    const result = await action(initialState, formData);

    expect(serverAction).not.toHaveBeenCalled();
    expect(result).toEqual({
      ...initialState,
      form: {
        teamName: 'my-team',
      },
      errors: {
        actionError: {
          title: 'Unauthorized',
          subtitle: 'You must be signed in.',
        },
      },
      status: ActionStatus.Error,
    });
  });
});
