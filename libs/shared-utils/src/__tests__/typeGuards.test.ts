// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode, FieldErrorCode, PROBLEM_STATUSES } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { isErrorCode, isFieldErrorCode, isProblem } from '../typeGuards.js';

const ALL_CODES = Object.values(ErrorCode);
const ALL_FIELD_CODES = Object.values(FieldErrorCode);

describe('isErrorCode', () => {
  it.each(ALL_CODES)('accepts %s', (code) => {
    expect(isErrorCode(code)).toBe(true);
  });

  it.each([
    ['an unknown code', 'NOT_A_REAL_CODE'],
    ['a field error code', FieldErrorCode.Duplicate],
    ['undefined', undefined],
    ['null', null],
    ['a number', 400],
  ])('rejects %s', (_name, value) => {
    expect(isErrorCode(value)).toBe(false);
  });
});

describe('isFieldErrorCode', () => {
  it.each(ALL_FIELD_CODES)('accepts %s', (code) => {
    expect(isFieldErrorCode(code)).toBe(true);
  });

  it.each([
    ['an unknown code', 'NOT_A_REAL_CODE'],
    ['undefined', undefined],
    ['null', null],
    ['a number', 1],
  ])('rejects %s', (_name, value) => {
    expect(isFieldErrorCode(value)).toBe(false);
  });
});

// Both guards check a Set rather than indexing a lookup table, because
// `PROBLEM_STATUSES['toString']` is defined via the prototype and would read as a valid code.
it.each(['toString', 'constructor', 'hasOwnProperty', '__proto__', 'valueOf'])(
  'rejects prototype member %s as either kind of code',
  (name) => {
    expect(isErrorCode(name)).toBe(false);
    expect(isFieldErrorCode(name)).toBe(false);
  },
);

describe('isProblem', () => {
  const base = {
    type: 'urn:fliposs:error:not-found',
    title: 'Not Found',
    status: PROBLEM_STATUSES[ErrorCode.NotFound],
    code: ErrorCode.NotFound,
  };

  it('accepts a document with only the required members', () => {
    expect(isProblem(base)).toBe(true);
  });

  it('accepts well-typed optional members', () => {
    expect(
      isProblem({
        ...base,
        detail: 'This segment does not exist.',
        instance: 'req-1',
        errors: [{ field: 'key', code: FieldErrorCode.Duplicate, detail: 'Already taken.' }],
      }),
    ).toBe(true);
  });

  it('accepts an empty errors array', () => {
    expect(isProblem({ ...base, errors: [] })).toBe(true);
  });

  it.each([
    ['a legacy { error } body', { error: 'Not found' }],
    ['a missing type', { title: base.title, status: base.status, code: base.code }],
    ['a missing title', { type: base.type, status: base.status, code: base.code }],
    ['an unknown code', { ...base, code: 'NOPE' }],
    ['a prototype member as the code', { ...base, code: 'constructor' }],
    ['a non-integer status', { ...base, status: 404.5 }],
    ['a status that disagrees with the code', { ...base, status: PROBLEM_STATUSES[ErrorCode.Internal] }],
    ['a non-string detail', { ...base, detail: 1 }],
    ['a non-string instance', { ...base, instance: {} }],
    ['a non-array errors', { ...base, errors: 'invalid' }],
    ['a null field error', { ...base, errors: [null] }],
    ['a non-object field error', { ...base, errors: ['INVALID'] }],
    ['a field error without a field', { ...base, errors: [{ code: FieldErrorCode.Invalid }] }],
    ['a field error with an unknown code', { ...base, errors: [{ field: 'key', code: 'NOPE' }] }],
    ['a field error with a non-string detail', { ...base, errors: [{ field: 'key', code: 'INVALID', detail: 2 }] }],
    ['a non-object', 'Not found'],
    ['null', null],
    ['undefined', undefined],
  ])('rejects %s', (_name, value) => {
    expect(isProblem(value)).toBe(false);
  });
});
