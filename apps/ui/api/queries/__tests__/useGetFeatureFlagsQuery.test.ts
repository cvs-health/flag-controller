// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetFeatureFlagsQuery from '../useGetFeatureFlagsQuery';
import { getFeatureFlagsUrl } from '../../requests/getFeatureFlags';

describe('useGetFeatureFlagsQuery', () => {
  it('should call the proper api', async () => {
    const search = 'search';
    const pagination = {
      page: 1,
      rows: 10,
    };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    renderHook(() => useGetFeatureFlagsQuery(search, pagination), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getFeatureFlagsUrl(pagination, search)}`,
      expect.any(Object),
    );
  });
});
