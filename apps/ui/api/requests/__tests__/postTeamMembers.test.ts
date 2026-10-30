// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { ApiError } from '../../../utils/ApiError';
import postTeamMembers, { postTeamMembersUrl } from '../postTeamMembers';

describe('postTeamMembers', () => {
  it('should call the api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(null, true, 201));
    const payload = { teamId: 'team-1', body: ['user-1', 'user-2'] };

    await postTeamMembers(payload);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(`${process.env.API_BASE_URL}${postTeamMembersUrl(payload.teamId)}`, {
      method: 'POST',
      body: JSON.stringify(payload.body),
      headers: expect.any(Object),
    });
  });

  it('should throw a typed ApiError when the api returns an error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(null, false, 500, 'Please try again'));

    const error = await postTeamMembers({ teamId: 'team-1', body: ['user-1'] }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
  });
});
