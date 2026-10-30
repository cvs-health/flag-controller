// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import createSegment from '../createSegment';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import { ActionStatus } from '../../typings/common';
import { postSegmentsUrl } from '../../api/requests/postSegments';

vi.mock('next/navigation', () => ({
  redirect: () => null,
}));

describe('createSegment', () => {
  const segment = {
    applicationId: 'applicationId',
    description: 'description',
    key: 'segment-key',
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a segment successfully', async () => {
    const formData = new FormData();
    const fetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    Object.entries(segment).forEach(([key, value]) => {
      formData.append(key, value);
    });

    await createSegment(
      {
        form: { applicationId: segment.applicationId, description: segment.description, key: segment.key },
        status: ActionStatus.Idle,
      },
      formData,
    );

    expect(fetch).toHaveBeenCalledExactlyOnceWith(`${process.env.API_BASE_URL}${postSegmentsUrl}`, {
      body: JSON.stringify([segment]),
      headers: expect.any(Object),
      method: 'POST',
    });
  });

  it('should return an error status when the segment is not created', async () => {
    const formData = new FormData();
    const prevState = {
      form: { applicationId: segment.applicationId, description: segment.description, key: segment.key },
      status: ActionStatus.Idle,
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(null, false));
    Object.entries(segment).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await createSegment(prevState, formData);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(`${process.env.API_BASE_URL}${postSegmentsUrl}`, {
      body: JSON.stringify([segment]),
      headers: expect.any(Object),
      method: 'POST',
    });
    expect(result).toEqual({
      form: { applicationId: segment.applicationId, description: segment.description, key: segment.key },
      errors: {
        actionError: {
          title: 'System error',
          subtitle: 'Something went wrong on our end. Try again in a moment.',
        },
      },
      status: ActionStatus.Error,
    });
  });

  it('should return field errors without posting an invalid segment', async () => {
    const formData = new FormData();
    const prevState = {
      form: { applicationId: '', description: '', key: '' },
      status: ActionStatus.Idle,
    };

    formData.append('applicationId', '');
    formData.append('description', '');
    formData.append('key', 'invalid key');

    const fetch = vi.spyOn(global, 'fetch');
    const result = await createSegment(prevState, formData);

    expect(fetch).not.toHaveBeenCalled();
    expect(result).toEqual({
      ...prevState,
      form: { applicationId: '', description: '', key: 'invalid key' },
      errors: {
        fieldErrors: {
          applicationId: ['Application is required.'],
          description: ['Description is required.'],
          key: ['Use lowercase letters, numbers, and hyphens only (e.g., my-segment).'],
        },
        formErrors: [],
      },
      status: ActionStatus.Error,
    });
  });
});
