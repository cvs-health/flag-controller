// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestQueryClientProvider from '../../../test/TestQueryClientProvider';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetUsersQuery from '../useGetUsersQuery';
import { getUsersUrl } from '../../requests/getUsers';

describe('useGetUsersQuery', () => {
  it('should call the proper api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    renderHook(() => useGetUsersQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledExactlyOnceWith(`${process.env.API_BASE_URL}${getUsersUrl}`, expect.any(Object));
    });
  });

  it('should return the users returned by the api', async () => {
    const users = [{ id: 'user-1', name: 'Adams, Jessica', email: 'jadams@iguana.com' }];
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(users));

    const { result } = renderHook(() => useGetUsersQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toEqual(true);
    });

    expect(result.current.data).toEqual(users);
  });

  it('should not fetch when the query is disabled', () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([]));

    renderHook(() => useGetUsersQuery({ enabled: false }), {
      wrapper: TestQueryClientProvider,
    });

    expect(fetch).not.toHaveBeenCalled();
  });
});
