// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from 'shared-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../ApiError';
import { throwPageError } from '../throwPageError';

const mocks = vi.hoisted(() => ({ notFound: vi.fn() }));

vi.mock('next/navigation', () => ({
  notFound: () => {
    mocks.notFound();
    throw new Error('NEXT_NOT_FOUND');
  },
}));

const problem = (code: ErrorCode, status: number) => new ApiError({ type: 't', title: 'T', status, code });

describe('throwPageError', () => {
  beforeEach(() => {
    mocks.notFound.mockClear();
  });

  it('routes a 404 to notFound()', () => {
    expect(() => throwPageError(problem(ErrorCode.NotFound, 404))).toThrow('NEXT_NOT_FOUND');
    expect(mocks.notFound).toHaveBeenCalledOnce();
  });

  it.each([
    ['a 403', problem(ErrorCode.Forbidden, 403)],
    ['a 500', problem(ErrorCode.Internal, 500)],
    ['a non-ApiError', new Error('boom')],
  ])('rethrows %s for the error boundary', (_name, error) => {
    expect(() => throwPageError(error)).toThrow(error);
    expect(mocks.notFound).not.toHaveBeenCalled();
  });
});
