// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import deleteTeamMember, { deleteTeamMemberUrl } from '../deleteTeamMember';

describe('deleteTeamMember', () => {
  it('should call the api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(undefined, true, 204));
    const requestPayload = {
      teamId: 'team-1',
      userId: 'user-1',
    };

    await deleteTeamMember(requestPayload);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}${deleteTeamMemberUrl('team-1', 'user-1')}`,
      {
        method: 'DELETE',
        body: undefined,
        headers: {
          cookie: '',
        },
      },
    );
  });
});
