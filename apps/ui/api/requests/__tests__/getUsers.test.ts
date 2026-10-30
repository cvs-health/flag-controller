// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getUsers, { getUsersUrl } from '../getUsers';

describe('getUsers', () => {
  it('should call the api', async () => {
    const users = [{ id: 'user-1', name: 'Adams, Jessica', email: 'jadams@iguana.com' }];
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(users));

    const result = await getUsers();

    expect(fetch).toHaveBeenCalledExactlyOnceWith(`${process.env.API_BASE_URL}${getUsersUrl}`, expect.any(Object));
    expect(result).toEqual(users);
  });
});
