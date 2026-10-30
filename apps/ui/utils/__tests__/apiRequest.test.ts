// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from 'shared-types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import apiRequest from '../apiRequest';
import { ApiError } from '../ApiError';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import resolvePromiseWithProblem from '../../test/resolvePromiseWithProblem';

describe('apiRequest', () => {
  const url = 'some-url';

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a successful response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    expect(await apiRequest(url)).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${url}`, {
      body: undefined,
      headers: {
        cookie: '',
      },
    });
  });

  it('should return undefined for a 204 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(undefined, true, 204));

    expect(await apiRequest(url)).toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should throw a typed ApiError for a non-successful response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(undefined, false, 500));

    const error = await apiRequest(url).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
    expect((error as ApiError).code).toBe(ErrorCode.Internal);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${url}`, {
      body: undefined,
      headers: {
        cookie: '',
      },
    });
  });

  it('should preserve status, code, detail and field errors from a problem body', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithProblem(ErrorCode.Validation, {
        detail: 'The request is invalid.',
        errors: [{ field: 'key', code: 'REQUIRED' }],
      }),
    );

    const error = (await apiRequest(url).catch((e: unknown) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.code).toBe(ErrorCode.Validation);
    expect(error.message).toBe('The request is invalid.');
    expect(error.fieldErrors).toEqual([{ field: 'key', code: 'REQUIRED' }]);
  });

  it('should still read the message from a legacy { error } body', async () => {
    const jsonError = JSON.stringify({ error: 'Feature flag not found', code: 'NOT_FOUND_ERROR' });

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(undefined, false, 404, jsonError));

    await expect(() => apiRequest(url)).rejects.toThrow('The requested item could not be found.');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should not surface raw text from a non-JSON error body', async () => {
    const plainTextError = '<html>502 Bad Gateway</html>';

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(undefined, false, 502, plainTextError));

    const error = (await apiRequest(url).catch((e: unknown) => e)) as ApiError;

    expect(error.message).not.toContain('Bad Gateway');
    expect(error.code).toBe(ErrorCode.Internal);
  });

  it('should throw a typed ApiError when the request never reaches the API', async () => {
    const cause = new TypeError('fetch failed: ECONNREFUSED 127.0.0.1:3001');

    vi.spyOn(global, 'fetch').mockRejectedValueOnce(cause);

    const error = (await apiRequest(url).catch((e: unknown) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe(ErrorCode.Internal);
    expect(error.message).not.toContain('ECONNREFUSED');
    expect(error.cause).toBe(cause);
  });

  it('should throw a typed ApiError when a successful body is not valid JSON', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new SyntaxError('Unexpected token < in JSON at position 0')),
    } as unknown as Response);

    const error = (await apiRequest(url).catch((e: unknown) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe(ErrorCode.Internal);
    expect(error.message).not.toContain('Unexpected token');
  });

  it('should fall back to the status when an error body cannot be read', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.reject(new Error('body already consumed')),
    } as unknown as Response);

    const error = (await apiRequest(url).catch((e: unknown) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe(ErrorCode.NotFound);
  });
});
