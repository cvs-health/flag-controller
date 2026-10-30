// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Scope } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetApplicationsQuery from '../useGetApplicationsQuery';
import { getApplicationsUrl } from '../../requests/getApplications';

describe('useGetApplicationsQuery', () => {
  it('should call the proper api', async () => {
    const pagination = { page: 1, rows: 10 };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    renderHook(() => useGetApplicationsQuery(pagination, Scope.Me), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledExactlyOnceWith(
        `${process.env.API_BASE_URL}${getApplicationsUrl(pagination, Scope.Me)}`,
        expect.any(Object),
      );
    });
  });
});
