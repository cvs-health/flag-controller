// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import { patchSegmentUrl } from '../../api/requests/patchSegment';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import { ActionStatus } from '../../typings/common';
import updateSegmentDetails from '../updateSegmentDetails';

describe('updateSegmentDetails', () => {
  it('should update details successfully', async () => {
    const data = {
      form: {
        segmentId: 'segment-id',
        description: 'description',
      },
      errorMessage: '',
      status: ActionStatus.Idle,
    };
    const formData = new FormData();
    const requestPayload = {
      body: {
        description: data.form.description,
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([]));
    Object.entries(data.form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    await updateSegmentDetails(data, formData);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${patchSegmentUrl(data.form.segmentId)}`, {
      headers: {
        'Content-Type': 'application/json',
        cookie: '',
      },
      method: 'PATCH',
      body: JSON.stringify(requestPayload.body),
    });
  });
});
