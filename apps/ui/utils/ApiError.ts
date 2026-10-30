// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode, PROBLEM_STATUSES, PROBLEM_TITLES, PROBLEM_TYPES, type Problem } from 'shared-types';
import { isProblem } from 'shared-utils';
import tryJsonParse from './tryJsonParse';

/** A failed API response. `message` is allow-listed copy from `messageFor`, never raw server text. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly problem: Problem;

  constructor(problem: Problem, options: { cause?: unknown } = {}) {
    super(messageFor(problem), options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'ApiError';
    this.status = problem.status;
    this.code = problem.code;
    this.problem = problem;
  }

  get fieldErrors() {
    return this.problem.errors ?? [];
  }

  fieldError(field: string) {
    return this.fieldErrors.find((error) => error.field === field);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const GENERIC_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.Validation]: 'Some of the information provided is not valid.',
  [ErrorCode.Unauthorized]: 'You must be signed in.',
  [ErrorCode.Forbidden]: 'You do not have access to this resource.',
  [ErrorCode.NotFound]: 'The requested item could not be found.',
  [ErrorCode.Conflict]: 'This conflicts with something that already exists.',
  [ErrorCode.Unprocessable]: 'This change could not be applied.',
  [ErrorCode.Internal]: 'Something went wrong on our end. Try again in a moment.',
};

// Codes whose `detail` the API writes for end users. Anything else gets the generic copy.
const DISPLAYS_DETAIL: ReadonlySet<ErrorCode> = new Set([
  ErrorCode.Validation,
  ErrorCode.Forbidden,
  ErrorCode.NotFound,
  ErrorCode.Conflict,
  ErrorCode.Unprocessable,
]);

export function messageFor(problem: Problem) {
  if (problem.detail && DISPLAYS_DETAIL.has(problem.code)) {
    return problem.detail;
  }

  return GENERIC_MESSAGES[problem.code];
}

const CODE_FOR_STATUS: Record<number, ErrorCode> = {
  400: ErrorCode.Validation,
  401: ErrorCode.Unauthorized,
  403: ErrorCode.Forbidden,
  404: ErrorCode.NotFound,
  409: ErrorCode.Conflict,
  422: ErrorCode.Unprocessable,
};

/**
 * Accepts an RFC 9457 problem document, the legacy `{ error }` body while the API migrates, or
 * anything else (proxy HTML, empty body) as a generic problem for the status.
 */
export function apiErrorFromBody(status: number, body: string) {
  const parsed = tryJsonParse(body);

  if (isProblem(parsed)) {
    return new ApiError(parsed);
  }

  const code = CODE_FOR_STATUS[status] ?? ErrorCode.Internal;

  return new ApiError({
    type: PROBLEM_TYPES[code],
    title: PROBLEM_TITLES[code],
    status: PROBLEM_STATUSES[code],
    code,
  });
}

/** No response to read: fetch rejected or the body was unparsable. The raw error is operator text, so it stays in `cause`. */
export function apiErrorFromTransport(cause: unknown) {
  const code = ErrorCode.Internal;

  return new ApiError(
    {
      type: PROBLEM_TYPES[code],
      title: PROBLEM_TITLES[code],
      status: PROBLEM_STATUSES[code],
      code,
    },
    { cause },
  );
}
