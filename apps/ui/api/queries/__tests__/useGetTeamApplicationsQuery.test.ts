// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetTeamApplicationsQuery from '../useGetTeamApplicationsQuery';
import { getTeamApplicationsUrl } from '../../requests/getTeamApplications';
import TestQueryClientProvider from '../../../test/TestQueryClientProvider';

describe('useGetTeamApplicationsQuery', () => {
  it('should call the proper api', async () => {
    const teamId = 'teamId';
    const pagination = { page: 1, rows: 10 };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    renderHook(() => useGetTeamApplicationsQuery(teamId, pagination), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledExactlyOnceWith(
        `${process.env.API_BASE_URL}${getTeamApplicationsUrl(teamId, pagination)}`,
        expect.any(Object),
      );
    });
  });
});
