// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetTeamAuditLogQuery from '../useGetTeamAuditLogQuery';
import { getTeamAuditLogUrl } from '../../requests/getTeamAuditLog';
import { ColumnSortingDirection } from '../../../typings/api';

describe('useGetTeamAuditLogQuery', () => {
  it('should call the proper api', async () => {
    const teamName = 'teamName';
    const sort = `createdAt:${ColumnSortingDirection.ASC}`;
    const pagination = { page: 1, rows: 10 };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    renderHook(() => useGetTeamAuditLogQuery(teamName, '', pagination, sort), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getTeamAuditLogUrl(teamName, '', pagination, sort)}`,
      expect.any(Object),
    );
  });
});
