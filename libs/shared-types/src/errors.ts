// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

/**
 * Error contract shared by the API and its consumers (RFC 9457 Problem Details). Clients branch on
 * `code`; `title` and `detail` are prose and may change.
 */

export const ErrorCode = {
  Validation: 'VALIDATION_ERROR',
  Unauthorized: 'UNAUTHORIZED',
  Forbidden: 'FORBIDDEN',
  NotFound: 'NOT_FOUND',
  Conflict: 'CONFLICT',
  Unprocessable: 'UNPROCESSABLE',
  Internal: 'INTERNAL',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Why one field failed, as opposed to `ErrorCode`, which is the outcome of the whole request. */
export const FieldErrorCode = {
  Required: 'REQUIRED',
  Invalid: 'INVALID',
  Duplicate: 'DUPLICATE',
  NotFound: 'NOT_FOUND',
  TooLong: 'TOO_LONG',
  TooShort: 'TOO_SHORT',
  OutOfRange: 'OUT_OF_RANGE',
} as const;

export type FieldErrorCode = (typeof FieldErrorCode)[keyof typeof FieldErrorCode];

export interface ProblemFieldError {
  /** Dotted path to the offending input, e.g. `key` or `variations.0.value`. */
  field: string;
  code: FieldErrorCode;
  /** Client-safe. Never SQL, driver text, or constraint names. */
  detail?: string;
}

/** An RFC 9457 problem document. Every 4xx/5xx response from the API has this shape. */
export interface Problem {
  /** Stable URI identifying the problem type. Not dereferenceable. */
  type: string;
  title: string;
  status: number;
  /** The stable machine-readable code. Branch on this. */
  code: ErrorCode;
  /** Client-safe explanation specific to this occurrence. */
  detail?: string;
  /** Request id; matches the server log lines for the same request. */
  instance?: string;
  errors?: ProblemFieldError[];
}

export const PROBLEM_CONTENT_TYPE = 'application/problem+json';

export const PROBLEM_TITLES: Record<ErrorCode, string> = {
  [ErrorCode.Validation]: 'Validation Failed',
  [ErrorCode.Unauthorized]: 'Unauthorized',
  [ErrorCode.Forbidden]: 'Forbidden',
  [ErrorCode.NotFound]: 'Not Found',
  [ErrorCode.Conflict]: 'Conflict',
  [ErrorCode.Unprocessable]: 'Unprocessable Content',
  [ErrorCode.Internal]: 'Internal Server Error',
};

export const PROBLEM_STATUSES: Record<ErrorCode, number> = {
  [ErrorCode.Validation]: 400,
  [ErrorCode.Unauthorized]: 401,
  [ErrorCode.Forbidden]: 403,
  [ErrorCode.NotFound]: 404,
  [ErrorCode.Conflict]: 409,
  [ErrorCode.Unprocessable]: 422,
  [ErrorCode.Internal]: 500,
};

/** `Problem.type` values. A URN because there is no hosted documentation to point at. */
export const PROBLEM_TYPES: Record<ErrorCode, string> = {
  [ErrorCode.Validation]: 'urn:fliposs:error:validation',
  [ErrorCode.Unauthorized]: 'urn:fliposs:error:unauthorized',
  [ErrorCode.Forbidden]: 'urn:fliposs:error:forbidden',
  [ErrorCode.NotFound]: 'urn:fliposs:error:not-found',
  [ErrorCode.Conflict]: 'urn:fliposs:error:conflict',
  [ErrorCode.Unprocessable]: 'urn:fliposs:error:unprocessable',
  [ErrorCode.Internal]: 'urn:fliposs:error:internal',
};
