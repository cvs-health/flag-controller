// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { apiErrorFromBody } from '../ApiError';
import tryCatchApiRequest from '../tryCatchApiRequest';

describe('tryCatchApiRequest', () => {
  it('returns the resolved value and no error when the request succeeds', async () => {
    const featureFlag = { id: 'flag-1', key: 'checkout-redesign' };

    const [data, error] = await tryCatchApiRequest(Promise.resolve(featureFlag));

    expect(data).toEqual(featureFlag);
    expect(error).toBeUndefined();
  });

  it('resolves with the ApiError instead of rejecting, so callers can branch on status and code', async () => {
    const notFound = apiErrorFromBody(404, '');

    const [data, error] = await tryCatchApiRequest(Promise.reject(notFound));

    expect(data).toBeUndefined();
    expect(error).toBe(notFound);
    expect((error as typeof notFound).status).toBe(404);
    expect((error as typeof notFound).code).toBe(ErrorCode.NotFound);
  });

  it('reports a 204 empty body to be empty', async () => {
    const [data, error] = await tryCatchApiRequest(Promise.resolve(undefined));

    expect(data).toBeUndefined();
    expect(error).toBeUndefined();
  });
});
