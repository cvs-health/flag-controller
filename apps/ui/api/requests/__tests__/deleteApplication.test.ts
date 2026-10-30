// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import deleteApplication, { deleteApplicationUrl } from '../deleteApplication';

describe('deleteApplication', () => {
  it('should build the plural resource path', () => {
    expect(deleteApplicationUrl('app-1')).toBe('applications/app-1');
  });

  it('should call the api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(undefined, true, 204));
    const requestPayload = {
      applicationId: 'app-1',
    };

    await deleteApplication(requestPayload);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}applications/app-1`, {
      method: 'DELETE',
      body: undefined,
      headers: {
        cookie: '',
      },
    });
  });
});
