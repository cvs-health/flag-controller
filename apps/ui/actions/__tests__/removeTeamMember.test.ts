// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import removeTeamMember from '../removeTeamMember';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import { ActionStatus } from '../../typings/common';

describe('removeTeamMember', () => {
  const initialState = {
    form: { userId: '', teamId: '' },
    status: ActionStatus.Idle,
  };

  it('returns success status when the member is removed', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(undefined, true, 204));
    const formData = new FormData();
    formData.set('userId', 'member-123');
    formData.set('teamId', 'team-456');

    const result = await removeTeamMember(initialState, formData);

    expect(result.status).toEqual(ActionStatus.Success);
    expect(result.form).toEqual({ userId: 'member-123', teamId: 'team-456' });
    expect(result.errors).toBeUndefined();
  });

  it('returns error status when validation fails', async () => {
    const formData = new FormData();
    formData.set('userId', '');
    formData.set('teamId', 'team-456');

    const result = await removeTeamMember(initialState, formData);

    expect(result.status).toEqual(ActionStatus.Error);
    expect(result.errors?.fieldErrors?.userId).toBeDefined();
  });

  it('returns error status when the api request fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(null, false, 500, 'Something went wrong'));
    const formData = new FormData();
    formData.set('userId', 'member-123');
    formData.set('teamId', 'team-456');

    const result = await removeTeamMember(initialState, formData);

    expect(result.status).toEqual(ActionStatus.Error);
    expect(result.errors?.actionError).toEqual({
      title: 'Failed to remove team member',
      subtitle: 'Something went wrong on our end. Try again in a moment.',
    });
  });
});
