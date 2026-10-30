// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestQueryClientProvider from '../../../test/TestQueryClientProvider';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetFeatureFlagVariationsQuery from '../useGetFeatureFlagVariationsQuery';
import { getFeatureFlagVariationsUrl } from '../../requests/getFeatureFlagVariations';

describe('useGetFeatureFlagVariationsQuery', () => {
  it('should call the proper api', async () => {
    const featureFlagId = 'feature-flag-id';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    renderHook(() => useGetFeatureFlagVariationsQuery(featureFlagId), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getFeatureFlagVariationsUrl(featureFlagId)}`,
      expect.any(Object),
    );
  });
});
