// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorCode } from 'shared-types';

import archiveFeatureFlag from '../archiveFeatureFlag';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import resolvePromiseWithProblem from '../../test/resolvePromiseWithProblem';
import { ActionStatus } from '../../typings/common';
import { patchFeatureFlagUrl } from '../../api/requests/patchFeatureFlag';

describe('archiveFeatureFlag', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should archive a flag successfully', async () => {
    const data = {
      featureFlagId: 'flag-id-123',
    };
    const formData = new FormData();
    const requestPayload = {
      featureFlagId: data.featureFlagId,
      body: {
        archived: true,
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([]));
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    await archiveFeatureFlag(data, formData);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${patchFeatureFlagUrl(requestPayload.featureFlagId)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          cookie: '',
        },
        method: 'PATCH',
        body: JSON.stringify(requestPayload.body),
      },
    );
  });

  it('should return error when flag is not successfully archived', async () => {
    const data = {
      featureFlagId: 'flag-id-123',
    };
    const formData = new FormData();

    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithProblem(ErrorCode.Forbidden, { detail: 'You cannot archive this feature flag.' }),
    );
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await archiveFeatureFlag(data, formData);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      ...data,
      errors: {
        actionError: {
          title: 'Failed to archive feature flag',
          subtitle: 'You cannot archive this feature flag.',
        },
      },
      status: ActionStatus.Error,
    });
  });
});
