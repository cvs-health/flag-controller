// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { SpanStatusCode } from '@opentelemetry/api';
import { FieldErrorCode } from 'shared-types';

import { type AppError, InternalError, isAppError, NotFoundError, ValidationError } from '../errors/AppError.js';
import { sendAppError } from '../errors/problem.js';

/**
 * Central error handler. Every error that escapes a route or hook leaves as an RFC 9457 problem
 * document. Anything unrecognized becomes `InternalError`, so an unexpected throw cannot leak a
 * driver string, stack, or SQL fragment.
 */
export function handleRouteError(error: unknown, request: FastifyRequest, reply: FastifyReply) {
  const appError = toAppError(error);

  recordOnSpan(request, appError, error);
  logAppError(request, appError, error);
  sendAppError(reply, appError, request.id);
}

/** Unmatched routes. Registered separately because Fastify answers them with its own body shape. */
export function handleNotFound(request: FastifyRequest, reply: FastifyReply) {
  const appError = new NotFoundError({
    message: `No route for ${request.method} ${request.url}`,
    detail: 'The requested resource does not exist.',
  });
  logAppError(request, appError, appError);
  sendAppError(reply, appError, request.id);
}

type FastifyValidationError = FastifyError & { validation: NonNullable<FastifyError['validation']> };

function toAppError(error: unknown) {
  if (isAppError(error)) {
    return error;
  }

  if (isFastifyValidationError(error)) {
    return new ValidationError({
      message: error.message,
      detail: 'The request is invalid.',
      errors: fieldErrorsFromFastify(error),
    });
  }

  if (isFastifyClientError(error)) {
    return new ValidationError({
      message: error.message,
      detail: 'The request could not be processed.',
      context: { fastifyCode: error.code, fastifyStatus: error.statusCode },
      cause: error,
    });
  }

  return new InternalError({
    message: error instanceof Error ? error.message : `Non-error thrown: ${typeof error}`,
    cause: error,
  });
}

/** 5xx at `error` with the original error; 4xx at `info`, so alerts are not swamped by client errors. */
function logAppError(request: FastifyRequest, appError: AppError, original: unknown) {
  const payload = {
    code: appError.code,
    status: appError.status,
    instance: request.id,
    ...(appError.context ? { context: appError.context } : {}),
  };

  if (appError.status >= 500) {
    request.log.error({ ...payload, err: original }, appError.message);
    return;
  }

  request.log.info(payload, appError.message);
}

/** Only 5xx record an exception; the OTel hook has already set status for any thrown error. */
function recordOnSpan(request: FastifyRequest, appError: AppError, original: unknown) {
  const span = requestSpan(request);

  if (!span) {
    return;
  }

  span.setStatus({ code: SpanStatusCode.ERROR, message: appError.code });

  if (appError.status < 500) {
    return;
  }

  span.recordException(original instanceof Error ? original : appError);
  span.setAttribute('error.type', appError.code);
}

// The decorator only exists when the OTel plugin is registered.
function requestSpan(request: FastifyRequest) {
  return typeof request.opentelemetry === 'function' ? (request.opentelemetry().span ?? undefined) : undefined;
}

function isFastifyValidationError(error: unknown): error is FastifyValidationError {
  return !!error && typeof error === 'object' && Array.isArray((error as FastifyError).validation);
}

function isFastifyClientError(error: unknown): error is FastifyError & { statusCode: number } {
  const statusCode = (error as FastifyError | undefined)?.statusCode;

  return typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500;
}

function fieldErrorsFromFastify(error: FastifyValidationError) {
  return error.validation.map((item) => {
    const params = item.params as Record<string, unknown> | undefined;
    const missing = stringParam(params, 'missingProperty');
    // Ajv names a missing or unexpected property in `params` and points `instancePath` at its parent.
    const named = missing ?? stringParam(params, 'additionalProperty');
    const field = joinField(instancePathToField(item.instancePath), named) ?? 'request';

    return {
      field,
      code: missing ? FieldErrorCode.Required : fieldErrorCodeFor(item.keyword),
      ...(item.message ? { detail: item.message } : {}),
    };
  });
}

function stringParam(params: Record<string, unknown> | undefined, key: string) {
  const value = params?.[key];

  return typeof value === 'string' ? value : undefined;
}

function joinField(parent: string | undefined, child: string | undefined) {
  if (parent && child) {
    return `${parent}.${child}`;
  }

  return child ?? parent;
}

// Ajv emits JSON-pointer paths (`/variations/0/value`); the UI binds on dotted paths.
function instancePathToField(instancePath: string | undefined) {
  return instancePath?.replace(/^\//, '').replace(/\//g, '.') || undefined;
}

function fieldErrorCodeFor(keyword: string | undefined) {
  switch (keyword) {
    case 'required':
      return FieldErrorCode.Required;
    case 'maxLength':
    case 'maxItems':
      return FieldErrorCode.TooLong;
    case 'minLength':
    case 'minItems':
      return FieldErrorCode.TooShort;
    case 'maximum':
    case 'minimum':
    case 'exclusiveMaximum':
    case 'exclusiveMinimum':
      return FieldErrorCode.OutOfRange;
    default:
      return FieldErrorCode.Invalid;
  }
}
