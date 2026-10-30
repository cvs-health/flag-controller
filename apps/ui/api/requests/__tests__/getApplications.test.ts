// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getApplications, { getApplicationsUrl } from '../getApplications';
import { Scope } from 'shared-types';

describe('getApplications', () => {
  it('should call the api', async () => {
    const pagination = { page: 1, rows: 10 };
    const scope = Scope.Me;
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getApplications(pagination, scope);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getApplicationsUrl(pagination, scope)}`,
      expect.any(Object),
    );
  });
});
