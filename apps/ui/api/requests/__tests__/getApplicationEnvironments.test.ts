// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getApplicationEnvironments, { getApplicationEnvironmentsUrl } from '../getApplicationEnvironments';

describe('getApplicationEnvironments', () => {
  it('should call the api', async () => {
    const applicationId = 'applicationId';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getApplicationEnvironments(applicationId);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}${getApplicationEnvironmentsUrl(applicationId)}`,
      expect.any(Object),
    );
  });
});
