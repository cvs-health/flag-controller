// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Scope } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getSegments, { getSegmentsUrl } from '../getSegments';

describe('getSegments', () => {
  it('should call the api', async () => {
    const pagination = { page: 1, rows: 10 };
    const search = 'search';
    const sort = 'createdAt:asc';
    const scope = Scope.Me;
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getSegments(pagination, search, sort, scope);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getSegmentsUrl(pagination, search, sort, scope)}`,
      expect.any(Object),
    );
  });
});
