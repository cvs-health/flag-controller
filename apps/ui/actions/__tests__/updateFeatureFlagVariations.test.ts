// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import updateFeatureFlagVariations from '../updateFeatureFlagVariations';
import { FormAction, ActionStatus } from '../../typings/common';
import { deleteVariationsUrl } from '../../api/requests/deleteVariations';
import { patchVariationsUrl } from '../../api/requests/patchVariations';
import { postVariationsUrl } from '../../api/requests/postVariations';

describe('updateFeatureFlagVariations', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should update variations successfully', async () => {
    const variations = [
      {
        id: 1,
        key: 'yes',
        value: 'true',
      },
      {
        id: 2,
        key: 'no',
        value: 'false',
      },
    ];
    const previousState = {
      errorMessage: '',
      status: ActionStatus.Idle,
    };
    const data = {
      applicationName: 'applicationName',
      featureFlagId: 'featureFlagId',
      featureFlagType: FeatureFlagType.Boolean,
      featureFlagKey: 'featureFlagKey',
      variations: JSON.stringify(variations),
    };
    const formData = new FormData();

    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([]));
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append('id', '1');
    formData.append('key', 'yes?');
    formData.append('value', 'true');
    formData.append('created', 'false');
    formData.append('removed', 'false');
    formData.append('id', '2');
    formData.append('key', 'no');
    formData.append('value', 'false');
    formData.append('created', 'false');
    formData.append('removed', 'true');
    formData.append('id', '234');
    formData.append('key', 'no?');
    formData.append('value', 'false');
    formData.append('removed', 'false');
    formData.append('created', 'true');

    await updateFeatureFlagVariations(previousState, formData);

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${postVariationsUrl}`, {
      headers: {
        'Content-Type': 'application/json',
        cookie: '',
      },
      method: 'POST',
      body: JSON.stringify([{ key: 'no?', value: false, flagId: 'featureFlagId' }]),
    });
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${patchVariationsUrl}`, {
      headers: {
        'Content-Type': 'application/json',
        cookie: '',
      },
      method: 'PATCH',
      body: JSON.stringify([{ id: '1', key: 'yes?', value: true }]),
    });
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${deleteVariationsUrl}`, {
      headers: {
        'Content-Type': 'application/json',
        cookie: '',
      },
      method: 'DELETE',
      body: JSON.stringify(['2']),
    });
  });

  it('should reset form when FormAction.ResetForm is passed', async () => {
    const initialState = {
      errorMessage: 'Some error',
      status: ActionStatus.Error,
    };
    const result = await updateFeatureFlagVariations(initialState, FormAction.ResetStatus);

    expect(result.errorMessage).toEqual(initialState.errorMessage);
    expect(result.status).toEqual(ActionStatus.Idle);
  });
});
