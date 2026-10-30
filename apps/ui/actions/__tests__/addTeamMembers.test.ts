// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import addTeamMembers, { type AddTeamMembersActionState } from '../addTeamMembers';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import { ActionStatus } from '../../typings/common';

describe('addTeamMembers', () => {
  const initialState: AddTeamMembersActionState = {
    form: { memberIds: [], teamId: '' },
    status: ActionStatus.Idle,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns success status when valid memberIds and teamId are provided', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(''));

    const formData = new FormData();
    formData.set('memberIds', JSON.stringify(['member-1', 'member-2']));
    formData.set('teamId', 'team-456');

    const result = await addTeamMembers(initialState, formData);

    expect(result.status).toEqual(ActionStatus.Success);
    expect(result.form).toEqual({ memberIds: ['member-1', 'member-2'], teamId: 'team-456' });
    expect(result.errors).toBeUndefined();
  });

  it('clears previous errors on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(''));

    const formData = new FormData();
    formData.set('memberIds', JSON.stringify(['member-1']));
    formData.set('teamId', 'team-456');

    const result = await addTeamMembers(
      {
        ...initialState,
        errors: {
          actionError: {
            title: 'Validation error',
            subtitle: 'You must add a member.',
          },
        },
        status: ActionStatus.Error,
      },
      formData,
    );

    expect(result.status).toEqual(ActionStatus.Success);
    expect(result.errors).toBeUndefined();
  });

  it('returns error status when memberIds is empty', async () => {
    const formData = new FormData();
    formData.set('memberIds', JSON.stringify([]));
    formData.set('teamId', 'team-456');

    const result = await addTeamMembers(initialState, formData);

    expect(result.status).toEqual(ActionStatus.Error);
    expect(result.errors).toBeDefined();
    expect(result.errors?.fieldErrors?.memberIds).toBeDefined();
  });
});
