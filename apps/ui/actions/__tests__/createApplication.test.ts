// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from 'shared-types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import createApplication from '../createApplication';
import { ActionStatus } from '../../typings/common';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import resolvePromiseWithProblem from '../../test/resolvePromiseWithProblem';

describe('createApplication', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const initialFormState = {
    form: {
      applicationName: '',
      teamId: '',
    },
    status: ActionStatus.Idle,
  };

  it('should create an application successfully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({}));
    const formData = new FormData();

    formData.append('applicationName', 'my-app-name');
    formData.append('teamId', 'team-1');

    const result = await createApplication(initialFormState, formData);

    expect(result).toEqual({
      form: {
        applicationName: 'my-app-name',
        teamId: 'team-1',
      },
      status: ActionStatus.Success,
    });
  });

  it('should handle validation error', async () => {
    const formData = new FormData();

    formData.append('applicationName', '');
    formData.append('teamId', '');

    const result = await createApplication(initialFormState, formData);

    expect(result).toEqual({
      ...initialFormState,
      errors: {
        fieldErrors: {
          applicationName: [
            'You must add an application name.',
            'Use lowercase letters, numbers, and hyphens only (e.g., my-app-name).',
          ],
          teamId: ['You must select a team.'],
        },
        formErrors: [],
      },
      status: ActionStatus.Error,
    });
  });

  it('should handle create application error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(null, false));

    const formData = new FormData();

    formData.append('applicationName', 'my-app-name');
    formData.append('teamId', 'team-1');

    const result = await createApplication(initialFormState, formData);

    expect(result).toEqual({
      ...initialFormState,
      form: {
        applicationName: 'my-app-name',
        teamId: 'team-1',
      },
      errors: {
        actionError: {
          subtitle: 'Something went wrong on our end. Try again in a moment.',
          title: 'Failed to create application',
        },
      },
      status: ActionStatus.Error,
    });
  });

  it('binds an API duplicate-name conflict to the applicationName field', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithProblem(ErrorCode.Conflict, {
        detail: 'An application with this name already exists.',
        errors: [{ field: 'name', code: 'DUPLICATE' }],
      }),
    );

    const formData = new FormData();

    formData.append('applicationName', 'my-app-name');
    formData.append('teamId', 'team-1');

    const result = await createApplication(initialFormState, formData);

    expect(result.status).toBe(ActionStatus.Error);
    expect(result.errors).toEqual({
      fieldErrors: { applicationName: ['This value is already in use.'] },
      actionError: {
        subtitle: 'An application with this name already exists.',
        title: 'Failed to create application',
      },
    });
  });
});
