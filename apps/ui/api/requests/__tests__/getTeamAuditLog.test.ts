// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getTeamAuditLog, { getTeamAuditLogUrl } from '../getTeamAuditLog';

describe('getTeamAuditLog', () => {
  it('should call the api', async () => {
    const teamId = 'teamId';
    const pagination = { page: 1, rows: 10 };
    const sort = 'date:desc';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getTeamAuditLog(teamId, '', pagination, sort);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}${getTeamAuditLogUrl(teamId, '', pagination, sort)}`,
      expect.any(Object),
    );
  });
});
