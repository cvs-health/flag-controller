// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Scope } from 'shared-types';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import type { ColumnSorting, Pagination } from '../../../typings/api';
import useGetSegmentsQuery from '../useGetSegmentsQuery';
import { getSegmentsUrl } from '../../requests/getSegments';

describe('useGetSegmentsQuery', () => {
  it('should call the proper api', async () => {
    const search = 'search';
    const pagination: Pagination = { page: 1, rows: 10 };
    const sort: ColumnSorting = 'createdAt:asc';
    const scope = Scope.Me;
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    renderHook(() => useGetSegmentsQuery(search, pagination, sort, scope), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getSegmentsUrl(pagination, search, sort, scope)}`,
      expect.any(Object),
    );
  });
});
