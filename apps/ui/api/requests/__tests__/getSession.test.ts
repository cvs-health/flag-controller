// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { ErrorCode } from 'shared-types';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import resolvePromiseWithProblem from '../../../test/resolvePromiseWithProblem';
import getSession, { getSessionUrl } from '../getSession';

describe('getSession', () => {
  it('should call the api', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(null));

    await getSession();

    expect(fetch).toHaveBeenCalledExactlyOnceWith(`${process.env.API_BASE_URL}${getSessionUrl}`, expect.any(Object));
  });

  it('returns no session when the API rejects the session', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithProblem(ErrorCode.Unauthorized));

    await expect(getSession()).resolves.toBeNull();
  });
});
