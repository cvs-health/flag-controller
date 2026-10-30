// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getUserApplications, { getUserApplicationsUrl } from '../getUserApplications';

describe('getUserApplications', () => {
  it('should call the api', async () => {
    const userId = '123';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getUserApplications(userId);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getUserApplicationsUrl(userId)}`,
      expect.any(Object),
    );
  });
});
