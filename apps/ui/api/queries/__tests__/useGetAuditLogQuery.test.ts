// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import type { ColumnSorting, Pagination } from '../../../typings/api';
import useGetAuditLogQuery from '../useGetAuditLogQuery';
import { ColumnSortingDirection } from '../../../typings/api';
import { getAuditLogUrl } from '../../requests/getAuditLog';

describe('useGetAuditLogQuery', () => {
  it('should call the proper api', async () => {
    const args: [string, Pagination, ColumnSorting, string] = [
      'search',
      { rows: 1, page: 1 },
      `createdAt:${ColumnSortingDirection.ASC}`,
      '',
    ];
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    renderHook(() => useGetAuditLogQuery(...args), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${getAuditLogUrl(...args)}`, expect.any(Object));
  });
});
