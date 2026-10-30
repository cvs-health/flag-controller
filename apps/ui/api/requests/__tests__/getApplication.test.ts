// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getApplication, { getApplicationUrl } from '../getApplication';

describe('getApplication', () => {
  it('should call the api', async () => {
    const applicationName = 'applicationName';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getApplication(applicationName);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}${getApplicationUrl(applicationName)}`,
      expect.any(Object),
    );
  });
});
