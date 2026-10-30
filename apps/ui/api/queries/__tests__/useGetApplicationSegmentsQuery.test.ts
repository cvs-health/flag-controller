// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetApplicationSegmentsQuery from '../useGetApplicationSegmentsQuery';
import { getApplicationSegmentsUrl } from '../../requests/getApplicationSegments';

describe('useGetApplicationSegmentsQuery', () => {
  it('should call the proper api', async () => {
    const applicationId = 'applicationId';
    const pagination = { page: 1, rows: 10 };
    const search = 'search';
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([]));

    renderHook(() => useGetApplicationSegmentsQuery(applicationId, search, pagination), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledExactlyOnceWith(
        `${process.env.API_BASE_URL}${getApplicationSegmentsUrl(applicationId, pagination, search)}`,
        expect.any(Object),
      );
    });
  });
});
