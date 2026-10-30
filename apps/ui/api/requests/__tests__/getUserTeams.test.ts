// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getUserTeams, { getUserTeamsUrl } from '../getUserTeams';

describe('getUserTeams', () => {
  it('should call the api', async () => {
    const userId = '123';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getUserTeams(userId);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}${getUserTeamsUrl(userId)}`,
      expect.any(Object),
    );
  });
});
