// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { ApiError, apiErrorFromBody, isApiError, messageFor } from '../ApiError';

describe('apiErrorFromBody', () => {
  it('uses an RFC 9457 problem body as-is', () => {
    const body = JSON.stringify({
      type: 'urn:fliposs:error:conflict',
      title: 'Conflict',
      status: 409,
      code: ErrorCode.Conflict,
      detail: 'A flag with this key already exists.',
      instance: 'req-1',
      errors: [{ field: 'key', code: 'DUPLICATE' }],
    });

    const error = apiErrorFromBody(409, body);

    expect(isApiError(error)).toBe(true);
    expect(error.status).toBe(409);
    expect(error.code).toBe(ErrorCode.Conflict);
    expect(error.message).toBe('A flag with this key already exists.');
    expect(error.problem.instance).toBe('req-1');
    expect(error.fieldError('key')).toEqual({ field: 'key', code: 'DUPLICATE' });
    expect(error.fieldError('name')).toBeUndefined();
  });

  it('maps a legacy { error } body to the code for its status without showing raw text', () => {
    const error = apiErrorFromBody(409, JSON.stringify({ error: 'Application with this name already exists' }));

    expect(error.code).toBe(ErrorCode.Conflict);
    expect(error.message).toBe('This conflicts with something that already exists.');
    expect(error.fieldErrors).toEqual([]);
  });

  it('does not show a legacy message for a 500', () => {
    const error = apiErrorFromBody(500, JSON.stringify({ error: 'insert into feature_flags failed' }));

    expect(error.code).toBe(ErrorCode.Internal);
    expect(error.message).not.toContain('feature_flags');
  });

  it.each([
    ['HTML from a proxy', 502, '<html><body>502 Bad Gateway</body></html>'],
    ['plain text', 500, 'Please try again'],
    ['unknown JSON shape', 500, JSON.stringify({ message: 'kaboom' })],
  ])('never renders %s', (_name, status, body) => {
    const error = apiErrorFromBody(status, body);

    expect(error.code).toBe(ErrorCode.Internal);
    expect(error.message).toBe('Something went wrong on our end. Try again in a moment.');
    expect(error.message).not.toContain(body);
  });

  it('treats an empty body as a generic internal error', () => {
    const error = apiErrorFromBody(500, '');

    expect(error.code).toBe(ErrorCode.Internal);
    expect(error.message).toBe('Something went wrong on our end. Try again in a moment.');
  });

  it('keeps 401 as typed data', () => {
    const error = apiErrorFromBody(401, '');

    expect(error.code).toBe(ErrorCode.Unauthorized);
    expect(error.status).toBe(401);
  });
});

describe('messageFor', () => {
  it('shows detail for client-correctable codes', () => {
    expect(
      messageFor({ type: 't', title: 'T', status: 404, code: ErrorCode.NotFound, detail: 'Flag not found.' }),
    ).toBe('Flag not found.');
  });

  it.each([ErrorCode.Internal, ErrorCode.Unauthorized])('ignores detail for %s', (code) => {
    const message = messageFor({ type: 't', title: 'T', status: 500, code, detail: 'internal text' });

    expect(message).not.toBe('internal text');
  });

  it('falls back to generic copy when detail is absent', () => {
    expect(messageFor({ type: 't', title: 'T', status: 409, code: ErrorCode.Conflict })).toBe(
      'This conflicts with something that already exists.',
    );
  });
});

describe('ApiError', () => {
  it('is an Error with a stable name', () => {
    const error = new ApiError({ type: 't', title: 'T', status: 404, code: ErrorCode.NotFound });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
  });
});
