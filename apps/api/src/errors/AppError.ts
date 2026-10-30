// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { type ErrorCode, ErrorCode as Code, type ProblemFieldError } from 'shared-types';

export interface AppErrorOptions {
  /** Internal. Logged, never serialized. May name tables, ids, and constraints. */
  message: string;
  /** Client-safe. Serialized as `Problem.detail`. Never SQL, driver text, or internal identifiers. */
  detail?: string;
  /** Diagnostic context. Logged, never serialized. Ids and names, not payloads or secrets. */
  context?: Record<string, unknown>;
  /** Field-level problems, when the failure is attributable to specific inputs. */
  errors?: ProblemFieldError[];
  cause?: unknown;
}

/**
 * Base class for every error this API produces deliberately. Services and repositories throw from
 * the same set, so the handler needs one mapping.
 */
export abstract class AppError extends Error {
  abstract readonly code: ErrorCode;
  abstract readonly status: number;

  readonly detail?: string;
  readonly context?: Record<string, unknown>;
  readonly errors?: ProblemFieldError[];

  constructor(options: AppErrorOptions) {
    super(options.message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = this.constructor.name;
    this.detail = options.detail;
    this.context = options.context;
    this.errors = options.errors;
  }
}

/** Request body, params, or querystring failed validation. */
export class ValidationError extends AppError {
  readonly code = Code.Validation;
  readonly status = 400;
}

/** No usable session. Authentication, not authorization. */
export class UnauthorizedError extends AppError {
  readonly code = Code.Unauthorized;
  readonly status = 401;

  constructor(options: Partial<AppErrorOptions> = {}) {
    super({ message: 'Unauthorized', detail: 'Authentication is required.', ...options });
  }
}

/** Authenticated, but not permitted to act on this resource. */
export class ForbiddenError extends AppError {
  readonly code = Code.Forbidden;
  readonly status = 403;

  constructor(options: Partial<AppErrorOptions> = {}) {
    super({ message: 'Forbidden', detail: 'You do not have access to this resource.', ...options });
  }
}

/** The addressed resource does not exist or is soft-deleted. */
export class NotFoundError extends AppError {
  readonly code = Code.NotFound;
  readonly status = 404;
}

/** The request conflicts with existing state, typically a uniqueness violation. */
export class ConflictError extends AppError {
  readonly code = Code.Conflict;
  readonly status = 409;
}

/** Well-formed request that violates a domain rule. The shape was fine; the meaning was not. */
export class UnprocessableError extends AppError {
  readonly code = Code.Unprocessable;
  readonly status = 422;
}

/** Something the caller cannot act on. `detail` is fixed (rejected at compile time); specifics go in `context`. */
export class InternalError extends AppError {
  readonly code = Code.Internal;
  readonly status = 500;

  constructor(options: Omit<AppErrorOptions, 'detail'>) {
    super({ ...options, detail: 'An unexpected error occurred.' });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
