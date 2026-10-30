// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { actionErrorsFrom } from '../actionErrorsFrom';
import { ApiError } from '../ApiError';

const base = { type: 't', title: 'T' };

describe('actionErrorsFrom', () => {
  it('maps problem field errors into fieldErrors and the safe message into the banner', () => {
    const error = new ApiError({
      ...base,
      status: 409,
      code: ErrorCode.Conflict,
      detail: 'Already exists.',
      errors: [
        { field: 'key', code: 'DUPLICATE' },
        { field: 'key', code: 'TOO_LONG', detail: 'Max 50 characters.' },
        { field: 'description', code: 'INVALID' },
      ],
    });

    expect(actionErrorsFrom(error, { title: 'Failed' })).toEqual({
      fieldErrors: {
        key: ['This value is already in use.', 'Max 50 characters.'],
        description: ['This value is not valid.'],
      },
      actionError: { title: 'Failed', subtitle: 'Already exists.' },
    });
  });

  it('renames API fields to form fields through fieldMap', () => {
    const error = new ApiError({
      ...base,
      status: 409,
      code: ErrorCode.Conflict,
      errors: [{ field: 'name', code: 'DUPLICATE' }],
    });

    expect(
      actionErrorsFrom<{ applicationName: string }>(error, { title: 'Failed' }, { name: 'applicationName' }),
    ).toEqual({
      fieldErrors: { applicationName: ['This value is already in use.'] },
      actionError: { title: 'Failed', subtitle: 'This conflicts with something that already exists.' },
    });
  });

  it('omits fieldErrors when the problem has none', () => {
    const error = new ApiError({ ...base, status: 404, code: ErrorCode.NotFound, detail: 'Team not found.' });

    expect(actionErrorsFrom(error, { title: 'Failed' })).toEqual({
      actionError: { title: 'Failed', subtitle: 'Team not found.' },
    });
  });

  it('never renders text from a non-ApiError', () => {
    const errors = actionErrorsFrom(new Error('ECONNREFUSED 127.0.0.1:3001'), { title: 'Failed' });

    expect(errors).toEqual({
      actionError: { title: 'Failed', subtitle: 'Something went wrong on our end. Try again in a moment.' },
    });
    expect(JSON.stringify(errors)).not.toContain('ECONNREFUSED');
  });
});
