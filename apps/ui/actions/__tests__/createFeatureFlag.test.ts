// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode, FeatureFlagType } from 'shared-types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import createFeatureFlag from '../createFeatureFlag';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import resolvePromiseWithProblem from '../../test/resolvePromiseWithProblem';
import { ActionStatus } from '../../typings/common';
import { postFeatureFlagUrl } from '../../api/requests/postFeatureFlag';

vi.mock('next/navigation', () => ({
  redirect: () => null,
}));

describe('createFeatureFlag', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a flag successfully', async () => {
    const data = {
      applicationId: 'application-id',
      defaultVariationKey: 'key-1',
      description: 'description',
      key: 'feature-flag-key',
      type: FeatureFlagType.String,
      variationKey1: 'key-1',
      variationKey2: 'key-2',
      variationValue1: 'value-1',
      variationValue2: 'value-2',
    };
    const formData = new FormData();
    const requestPayload = {
      applicationId: data.applicationId,
      body: {
        defaultVariationKey: data.defaultVariationKey,
        description: data.description,
        enabled: false,
        key: data.key,
        type: data.type,
        variations: {
          [data.variationKey1]: data.variationValue1,
          [data.variationKey2]: data.variationValue2,
        },
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await createFeatureFlag(
      {
        status: ActionStatus.Error,
        errors: {
          actionError: {
            title: 'System error',
            subtitle: 'Please try again',
          },
        },
        form: data,
      },
      formData,
    );

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}${postFeatureFlagUrl(requestPayload.applicationId)}`,
      {
        headers: expect.any(Object),
        method: 'POST',
        body: JSON.stringify(requestPayload.body),
      },
    );
    expect(result).toEqual({
      form: data,
      status: ActionStatus.Success,
    });
  });

  it('should return error when flag is not successfully created', async () => {
    const data = {
      applicationId: 'applicationId',
      defaultVariationKey: 'key-1',
      description: 'description',
      key: 'feature-flag-key',
      type: FeatureFlagType.String,
      variationKey1: 'key-1',
      variationKey2: 'key-2',
      variationValue1: 'value-1',
      variationValue2: 'value-2',
    };
    const formData = new FormData();

    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(null, false, 500, 'Please try again'));
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await createFeatureFlag({ status: ActionStatus.Idle, form: data }, formData);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      status: ActionStatus.Error,
      errors: {
        actionError: {
          title: 'System error',
          subtitle: 'Something went wrong on our end. Try again in a moment.',
        },
      },
      form: {
        applicationId: 'applicationId',
        defaultVariationKey: 'key-1',
        description: 'description',
        key: 'feature-flag-key',
        type: FeatureFlagType.String,
        variationKey1: 'key-1',
        variationKey2: 'key-2',
        variationValue1: 'value-1',
        variationValue2: 'value-2',
      },
    });
  });

  it('binds a duplicate-key conflict to the key field', async () => {
    const data = {
      applicationId: 'applicationId',
      defaultVariationKey: 'key-1',
      description: 'description',
      key: 'taken',
      type: FeatureFlagType.String,
      variationKey1: 'key-1',
      variationKey2: 'key-2',
      variationValue1: 'value-1',
      variationValue2: 'value-2',
    };
    const formData = new FormData();

    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithProblem(ErrorCode.Conflict, {
        detail: 'A feature flag with this key already exists for this application.',
        errors: [{ field: 'key', code: 'DUPLICATE' }],
      }),
    );
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await createFeatureFlag({ status: ActionStatus.Idle, form: data }, formData);

    expect(result.status).toBe(ActionStatus.Error);
    expect(result.errors).toEqual({
      fieldErrors: { key: ['This value is already in use.'] },
      actionError: {
        title: 'System error',
        subtitle: 'A feature flag with this key already exists for this application.',
      },
    });
  });
});
