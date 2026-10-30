// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestQueryClientProvider from '../../../test/TestQueryClientProvider';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetUserTeamsQuery from '../useGetUserTeamsQuery';
import { getUserTeamsUrl } from '../../requests/getUserTeams';

describe('useGetUserTeamsQuery', () => {
  it('should call the proper api', async () => {
    const userId = '123';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    renderHook(() => useGetUserTeamsQuery(userId), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledExactlyOnceWith(
        `${process.env.API_BASE_URL}${getUserTeamsUrl(userId)}`,
        expect.any(Object),
      );
    });
  });
});
