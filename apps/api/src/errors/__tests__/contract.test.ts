// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode, FieldErrorCode, PROBLEM_STATUSES, PROBLEM_TITLES, PROBLEM_TYPES, type Problem } from 'shared-types';

import { isProblem } from 'shared-utils';
import { describe, expect, it } from 'vitest';

import { problemSchema } from '../../schemas/responses.js';
import {
  type AppError,
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableError,
  ValidationError,
} from '../AppError.js';
import { toProblem } from '../problem.js';

const ALL_CODES = Object.values(ErrorCode);

// One concrete error per code, so a new code without a class fails this suite. `satisfies` keeps the
// exhaustiveness check without widening the instances back to a structural type.
const ERROR_FOR_CODE = {
  [ErrorCode.Validation]: () => new ValidationError({ message: 'x' }),
  [ErrorCode.Unauthorized]: () => new UnauthorizedError(),
  [ErrorCode.Forbidden]: () => new ForbiddenError(),
  [ErrorCode.NotFound]: () => new NotFoundError({ message: 'x' }),
  [ErrorCode.Conflict]: () => new ConflictError({ message: 'x' }),
  [ErrorCode.Unprocessable]: () => new UnprocessableError({ message: 'x' }),
  [ErrorCode.Internal]: () => new InternalError({ message: 'x' }),
} satisfies Record<ErrorCode, () => AppError>;

describe('error code exhaustiveness', () => {
  it.each(ALL_CODES)('%s has a title, status and type', (code) => {
    expect(PROBLEM_TITLES[code]).toBeTruthy();
    expect(PROBLEM_STATUSES[code]).toBeGreaterThanOrEqual(400);
    expect(PROBLEM_TYPES[code]).toMatch(/^urn:fliposs:error:[a-z-]+$/);
  });

  it.each(ALL_CODES)('%s has a concrete AppError subclass whose status agrees', (code) => {
    const error = ERROR_FOR_CODE[code]();

    expect(error.code).toBe(code);
    expect(error.status).toBe(PROBLEM_STATUSES[code]);
  });

  it('has no duplicate type URIs', () => {
    const types = ALL_CODES.map((code) => PROBLEM_TYPES[code]);

    expect(new Set(types).size).toBe(types.length);
  });
});

describe('problemSchema agrees with the Problem type', () => {
  it('declares every property the serializer can emit', () => {
    const problem = toProblem(
      new ValidationError({ message: 'x', detail: 'd', errors: [{ field: 'f', code: 'INVALID' }] }),
      'req-1',
    );

    for (const key of Object.keys(problem) as (keyof Problem)[]) {
      expect(problemSchema.properties).toHaveProperty(key);
    }
  });

  it('requires exactly the fields the serializer always populates', () => {
    expect([...problemSchema.required]).toEqual(['type', 'title', 'status', 'code']);
  });

  it('declares status as an integer', () => {
    expect(problemSchema.properties.status.type).toBe('integer');
  });
});

// `isProblem` itself is covered in shared-utils; here it only asserts that what we serialize is valid.
describe('toProblem', () => {
  it.each(ALL_CODES)('produces a valid problem document for %s', (code) => {
    const problem = toProblem(ERROR_FOR_CODE[code](), 'req-1');

    expect(isProblem(problem)).toBe(true);
  });

  it('produces a valid problem document carrying detail and field errors', () => {
    const problem = toProblem(
      new ValidationError({ message: 'x', detail: 'd', errors: [{ field: 'key', code: FieldErrorCode.Duplicate }] }),
      'req-1',
    );

    expect(isProblem(problem)).toBe(true);
  });
});
