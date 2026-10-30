// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import useGetApplicationSegmentQuery from '../useGetApplicationSegmentQuery';
import { getApplicationSegmentUrl } from '../../requests/getApplicationSegment';
import TestQueryClientProvider from '../../../test/TestQueryClientProvider';

describe('useGetApplicationSegmentQuery', () => {
  it('should call the proper api', async () => {
    const applicationName = 'applicationName';
    const segmentKey = 'segmentKey';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData({}));

    renderHook(() => useGetApplicationSegmentQuery(applicationName, segmentKey), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getApplicationSegmentUrl(applicationName, segmentKey)}`,
      expect.any(Object),
    );
  });
});
