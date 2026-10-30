// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestQueryClientProvider from '../../../test/TestQueryClientProvider';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetFeatureFlagQuery from '../useGetFeatureFlagQuery';
import { getFeatureFlagUrl } from '../../requests/getFeatureFlag';

describe('useGetFeatureFlagQuery', () => {
  it('should call the proper api', async () => {
    const args: [string, string] = ['applicationName', 'featureFlagKey'];
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([]));

    renderHook(() => useGetFeatureFlagQuery(...args), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${getFeatureFlagUrl(...args)}`, expect.any(Object));
  });
});
