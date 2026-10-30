// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyReply, FastifyRequest } from 'fastify';
import { ErrorCode, PROBLEM_CONTENT_TYPE } from 'shared-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableError,
  ValidationError,
} from '../../errors/AppError.js';
import { handleRouteError } from '../errorHandler.js';

function context() {
  const reply = { code: vi.fn(), type: vi.fn(), send: vi.fn() };
  reply.code.mockReturnValue(reply);
  reply.type.mockReturnValue(reply);
  reply.send.mockReturnValue(reply);

  const log = { info: vi.fn(), error: vi.fn(), warn: vi.fn() };
  const request = { id: 'req-1', log } as unknown as FastifyRequest;

  return { reply: reply as unknown as FastifyReply & typeof reply, request, log };
}

function sentBody(reply: { send: ReturnType<typeof vi.fn> }) {
  return reply.send.mock.calls[0]?.[0] as Record<string, unknown>;
}

describe('handleRouteError', () => {
  let ctx: ReturnType<typeof context>;

  beforeEach(() => {
    ctx = context();
  });

  describe('AppError', () => {
    it.each([
      [() => new ValidationError({ message: 'bad' }), 400, ErrorCode.Validation],
      [() => new UnauthorizedError(), 401, ErrorCode.Unauthorized],
      [() => new ForbiddenError(), 403, ErrorCode.Forbidden],
      [() => new NotFoundError({ message: 'gone' }), 404, ErrorCode.NotFound],
      [() => new ConflictError({ message: 'dupe' }), 409, ErrorCode.Conflict],
      [() => new UnprocessableError({ message: 'rule' }), 422, ErrorCode.Unprocessable],
      [() => new InternalError({ message: 'boom' }), 500, ErrorCode.Internal],
    ])('sends %s as %i %s', (make, status, code) => {
      handleRouteError(make(), ctx.request, ctx.reply);

      expect(ctx.reply.code).toHaveBeenCalledWith(status);
      expect(ctx.reply.type).toHaveBeenCalledWith(PROBLEM_CONTENT_TYPE);
      expect(sentBody(ctx.reply)).toMatchObject({ status, code, instance: 'req-1' });
    });

    it('never serializes context or cause', () => {
      handleRouteError(
        new NotFoundError({
          message: 'segments row abc missing',
          detail: 'Segment not found.',
          context: { table: 'segments', id: 'abc' },
          cause: new Error('driver text'),
        }),
        ctx.request,
        ctx.reply,
      );

      const wire = JSON.stringify(sentBody(ctx.reply));

      expect(wire).toContain('Segment not found.');
      expect(wire).not.toContain('segments row');
      expect(wire).not.toContain('abc');
      expect(wire).not.toContain('driver text');
    });
  });

  describe('Fastify errors', () => {
    it('turns schema validation failures into field errors', () => {
      const error = Object.assign(new Error("body must have required property 'key'"), {
        statusCode: 400,
        validation: [
          { instancePath: '', keyword: 'required', params: { missingProperty: 'key' }, message: 'is required' },
          { instancePath: '/variations/0/value', keyword: 'maxLength', params: {}, message: 'too long' },
        ],
      });

      handleRouteError(error, ctx.request, ctx.reply);

      expect(ctx.reply.code).toHaveBeenCalledWith(400);
      expect(sentBody(ctx.reply)).toMatchObject({
        code: ErrorCode.Validation,
        errors: [
          { field: 'key', code: 'REQUIRED', detail: 'is required' },
          { field: 'variations.0.value', code: 'TOO_LONG', detail: 'too long' },
        ],
      });
    });

    it('keeps the parent path for a property missing inside an array item', () => {
      const error = Object.assign(new Error("body/variations/2 must have required property 'value'"), {
        statusCode: 400,
        validation: [
          {
            instancePath: '/variations/2',
            keyword: 'required',
            params: { missingProperty: 'value' },
            message: 'is required',
          },
        ],
      });

      handleRouteError(error, ctx.request, ctx.reply);

      // Ajv names the absent property in `params` and points `instancePath` at its parent, so using
      // either one alone reports `value` or `variations.2` — neither identifies the input.
      expect(sentBody(ctx.reply)).toMatchObject({
        errors: [{ field: 'variations.2.value', code: 'REQUIRED' }],
      });
    });

    it('names the offending property for an unexpected one', () => {
      const error = Object.assign(new Error('body must NOT have additional properties'), {
        statusCode: 400,
        validation: [
          {
            instancePath: '/variations/0',
            keyword: 'additionalProperties',
            params: { additionalProperty: 'nope' },
            message: 'must NOT have additional properties',
          },
        ],
      });

      handleRouteError(error, ctx.request, ctx.reply);

      expect(sentBody(ctx.reply)).toMatchObject({
        errors: [{ field: 'variations.0.nope', code: 'INVALID' }],
      });
    });

    it.each([413, 415, 400])('normalizes transport status %i to validation', (statusCode) => {
      const error = Object.assign(new Error('transport'), { statusCode, code: 'FST_ERR_CTP_SOMETHING' });

      handleRouteError(error, ctx.request, ctx.reply);

      expect(ctx.reply.code).toHaveBeenCalledWith(400);
      expect(sentBody(ctx.reply)).toMatchObject({ status: 400, code: ErrorCode.Validation });
      expect(JSON.stringify(sentBody(ctx.reply))).not.toContain('FST_ERR');
    });
  });

  describe('unknown errors', () => {
    it.each([
      ['Error', new Error('duplicate key value violates unique constraint "x_pkey"')],
      ['string', 'kaboom'],
      ['null', null],
      ['object', { weird: true }],
    ])('maps a thrown %s to 500 without leaking it', (_name, thrown) => {
      handleRouteError(thrown, ctx.request, ctx.reply);

      expect(ctx.reply.code).toHaveBeenCalledWith(500);
      expect(sentBody(ctx.reply)).toMatchObject({
        code: ErrorCode.Internal,
        detail: 'An unexpected error occurred.',
      });
      expect(JSON.stringify(sentBody(ctx.reply))).not.toContain('unique constraint');
      expect(JSON.stringify(sentBody(ctx.reply))).not.toContain('kaboom');
    });
  });

  describe('logging', () => {
    it('logs 4xx at info without the error object', () => {
      handleRouteError(
        new NotFoundError({ message: 'flag abc missing', context: { id: 'abc' } }),
        ctx.request,
        ctx.reply,
      );

      expect(ctx.log.info).toHaveBeenCalledWith(
        { code: ErrorCode.NotFound, status: 404, instance: 'req-1', context: { id: 'abc' } },
        'flag abc missing',
      );
      expect(ctx.log.error).not.toHaveBeenCalled();
    });

    it('logs 5xx at error with the original error', () => {
      const original = new Error('boom');

      handleRouteError(original, ctx.request, ctx.reply);

      expect(ctx.log.error).toHaveBeenCalledWith(
        expect.objectContaining({ code: ErrorCode.Internal, status: 500, instance: 'req-1', err: original }),
        'boom',
      );
      expect(ctx.log.info).not.toHaveBeenCalled();
    });
  });
});
