// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetApplicationEnvironmentSegmentsQuery from '../useGetApplicationEnvironmentSegmentsQuery';
import { getApplicationEnvironmentSegmentsUrl } from '../../requests/getApplicationEnvironmentSegments';

describe('useGetApplicationEnvironmentSegmentsQuery', () => {
  it('should call the proper api', async () => {
    const applicationName = 'applicationName';
    const environmentKey = 'environmentKey';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    renderHook(() => useGetApplicationEnvironmentSegmentsQuery(applicationName, environmentKey), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getApplicationEnvironmentSegmentsUrl(applicationName, environmentKey)}`,
      expect.any(Object),
    );
  });
});
