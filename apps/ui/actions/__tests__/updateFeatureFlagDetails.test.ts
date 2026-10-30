// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import { patchFeatureFlagUrl } from '../../api/requests/patchFeatureFlag';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import resolvePromiseWithProblem from '../../test/resolvePromiseWithProblem';
import { ActionStatus } from '../../typings/common';
import updateFeatureFlagDetails from '../updateFeatureFlagDetails';

describe('updateFeatureFlagDetails', () => {
  it('should update feature flag details successfully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([]));

    const data = {
      form: {
        featureFlagId: 'flag-id-123',
        description: 'description',
      },
      status: ActionStatus.Idle,
    };
    const formData = new FormData();
    const requestPayload = {
      featureFlagId: data.form.featureFlagId,
      body: {
        description: data.form.description,
        archived: false,
      },
    };

    Object.entries(data.form).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    await updateFeatureFlagDetails(data, formData);

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

  it('surfaces the API message when the update fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithProblem(ErrorCode.NotFound, { detail: 'Feature flag not found.' }),
    );
    const formData = new FormData();
    formData.append('featureFlagId', 'flag-id-123');
    formData.append('description', 'description');

    const result = await updateFeatureFlagDetails(
      { form: { featureFlagId: 'flag-id-123', description: '' }, status: ActionStatus.Idle },
      formData,
    );

    expect(result.status).toBe(ActionStatus.Error);
    expect(result.errors?.actionError).toEqual({
      title: 'System error',
      subtitle: 'Feature flag not found.',
    });
  });
});
