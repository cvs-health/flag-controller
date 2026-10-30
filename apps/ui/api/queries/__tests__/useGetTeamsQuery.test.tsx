// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetTeamsQuery from '../useGetTeamsQuery';
import { getTeamsUrl } from '../../requests/getTeams';
import TestQueryClientProvider from '../../../test/TestQueryClientProvider';

describe('useGetTeamsQuery', () => {
  it('should call the proper api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));
    const pagination = { page: 1, rows: 10 };

    renderHook(() => useGetTeamsQuery(pagination), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledExactlyOnceWith(
        `${process.env.API_BASE_URL}${getTeamsUrl(pagination)}`,
        expect.any(Object),
      );
    });
  });
});
