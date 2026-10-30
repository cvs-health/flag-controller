// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetApplicationFeatureFlagsQuery from '../useGetApplicationFeatureFlagsQuery';
import { getApplicationFeatureFlagsUrl } from '../../requests/getApplicationFeatureFlags';

describe('useGetApplicationFeatureFlagsQuery', () => {
  it('should call the proper api', async () => {
    const applicationId = 'application-id';
    const search = 'search';
    const pagination = {
      page: 1,
      rows: 10,
    };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    renderHook(() => useGetApplicationFeatureFlagsQuery(applicationId, search, pagination), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getApplicationFeatureFlagsUrl(applicationId, pagination, search)}`,
      expect.any(Object),
    );
  });
});
