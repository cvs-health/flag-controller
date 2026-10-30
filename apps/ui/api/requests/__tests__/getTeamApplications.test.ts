// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getTeamApplications from '../getTeamApplications';

describe('getTeamApplications', () => {
  it('should call the api', async () => {
    const teamName = 'teamName';
    const pagination = { page: 1, rows: 10 };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getTeamApplications(teamName, pagination);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}teams/${teamName}/applications?page=${pagination.page}&rows=${pagination.rows}`,
      expect.any(Object),
    );
  });
});
