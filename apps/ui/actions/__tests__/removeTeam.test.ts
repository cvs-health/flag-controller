// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import removeTeam from '../removeTeam';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import { ActionStatus } from '../../typings/common';

describe('removeTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const initialFormState = {
    form: {
      teamName: 'my-team',
      teamId: 'team-1',
    },
    status: ActionStatus.Idle,
  };

  const session = {
    session: {
      activeOrganizationId: 'org-1',
    },
  };

  function mockFetch(sessionData: unknown, deleteOk: boolean, deleteStatus = 204, deleteErrorBody = '') {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(resolvePromiseWithData(sessionData))
      .mockResolvedValueOnce(resolvePromiseWithData(null, deleteOk, deleteStatus, deleteErrorBody));
  }

  it('should remove a team successfully', async () => {
    mockFetch(session, true);

    const formData = new FormData();
    formData.append('teamName', 'my-team');
    formData.append('teamId', 'team-1');

    const result = await removeTeam(initialFormState, formData);

    expect(result).toEqual({
      form: {
        teamName: 'my-team',
        teamId: 'team-1',
      },
      status: ActionStatus.Success,
    });
  });

  it('should return unauthorized when there is no session', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(null));

    const formData = new FormData();
    formData.append('teamName', 'my-team');
    formData.append('teamId', 'team-1');

    const result = await removeTeam(initialFormState, formData);

    expect(result).toEqual({
      ...initialFormState,
      form: {
        teamName: 'my-team',
        teamId: 'team-1',
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

  it('should surface the error message from the API', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(resolvePromiseWithData(session))
      .mockResolvedValueOnce(resolvePromiseWithData(null, false, 422, JSON.stringify({ error: 'Some API error' })));

    const formData = new FormData();
    formData.append('teamName', 'my-team');
    formData.append('teamId', 'team-1');

    const result = await removeTeam(initialFormState, formData);

    expect(result.errors?.actionError).toEqual({
      title: 'Failed to remove team',
      subtitle: 'This change could not be applied.',
    });
  });

  it('should return field errors when validation fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(session));

    const formData = new FormData();
    formData.append('teamName', '');
    formData.append('teamId', 'team-1');

    const result = await removeTeam(initialFormState, formData);

    expect(result.status).toBe(ActionStatus.Error);
    expect(result.errors?.fieldErrors?.teamName).toBeDefined();
  });
});
