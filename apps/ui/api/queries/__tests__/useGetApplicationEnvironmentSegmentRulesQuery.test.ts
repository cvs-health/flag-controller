// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetApplicationEnvironmentSegmentRulesQuery from '../useGetApplicationEnvironmentSegmentRulesQuery';
import { getApplicationEnvironmentSegmentRulesUrl } from '../../requests/getApplicationEnvironmentSegmentRules';

describe('useGetApplicationEnvironmentSegmentRulesQuery', () => {
  it('should call the proper api', async () => {
    const args: [string, string, string] = ['applicationName', 'environmentKey', 'segmentKey'];
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    renderHook(() => useGetApplicationEnvironmentSegmentRulesQuery(...args), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getApplicationEnvironmentSegmentRulesUrl(...args)}`,
      expect.any(Object),
    );
  });
});
