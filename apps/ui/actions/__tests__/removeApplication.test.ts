// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import removeApplication from '../removeApplication';
import { ActionStatus } from '../../typings/common';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';

vi.mock('next/navigation', () => ({
  redirect: () => null,
}));

describe('removeApplication', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const initialFormState = {
    form: {
      applicationName: '',
      applicationId: '',
    },
    status: ActionStatus.Idle,
  };

  it('should remove an application successfully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(undefined, true, 204));
    const formData = new FormData();

    formData.append('applicationName', 'my-app-name');
    formData.append('applicationId', 'app-1');

    const result = await removeApplication(initialFormState, formData);

    expect(result).toEqual({
      form: {
        applicationName: 'my-app-name',
        applicationId: 'app-1',
      },
      status: ActionStatus.Success,
    });
  });

  it('should handle validation error', async () => {
    const formData = new FormData();

    formData.append('applicationName', '');
    formData.append('applicationId', '');

    const result = await removeApplication(initialFormState, formData);

    expect(result).toEqual({
      ...initialFormState,
      errors: {
        fieldErrors: {
          applicationName: ['You must select an application.'],
          applicationId: ['You must select an application.'],
        },
        formErrors: [],
      },
      status: ActionStatus.Error,
    });
  });

  it('should handle remove application error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(null, false));

    const formData = new FormData();

    formData.append('applicationName', 'my-app-name');
    formData.append('applicationId', 'app-1');

    const result = await removeApplication(initialFormState, formData);

    expect(result).toEqual({
      ...initialFormState,
      form: {
        applicationName: 'my-app-name',
        applicationId: 'app-1',
      },
      errors: {
        actionError: {
          title: 'Failed to remove application',
          subtitle: 'Something went wrong on our end. Try again in a moment.',
        },
      },
      status: ActionStatus.Error,
    });
  });
});
