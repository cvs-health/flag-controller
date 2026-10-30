// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import usePatchFeatureFlagEnvironmentMutation from '../usePatchFeatureFlagEnvironmentMutation';
import { patchFeatureFlagEnvironmentUrl } from '../../requests/patchFeatureFlagEnvironment';

describe('usePatchFeatureFlagEnvironmentMutation', () => {
  it('should call the proper api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));
    const body = {
      enabled: true,
    };
    const environmentId = 'env-id-123';
    const featureFlagId = 'flag-id-456';
    const payload = {
      environmentId,
      featureFlagId,
      body,
    };
    const { result } = renderHook(() => usePatchFeatureFlagEnvironmentMutation(), {
      wrapper: TestProviders,
    });

    result.current.mutate(payload);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${patchFeatureFlagEnvironmentUrl(environmentId, featureFlagId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          cookie: '',
        },
      },
    );
  });
});
