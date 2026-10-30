// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getApplicationAuditLog, { getApplicationAuditLogUrl } from '../getApplicationAuditLog';

describe('getApplicationAuditLog', () => {
  it('should call the api', async () => {
    const pagination = {
      page: 1,
      rows: 10,
    };
    const sort = 'createdAt:desc';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getApplicationAuditLog('application-id', pagination, sort);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getApplicationAuditLogUrl('application-id', pagination, sort)}`,
      expect.any(Object),
    );
  });
});
