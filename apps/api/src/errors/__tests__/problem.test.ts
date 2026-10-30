// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyReply } from 'fastify';
import { ErrorCode, PROBLEM_CONTENT_TYPE } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import { ConflictError, InternalError, NotFoundError } from '../AppError.js';
import { sendAppError, toProblem } from '../problem.js';

function mockReply() {
  const reply = {
    code: vi.fn(),
    type: vi.fn(),
    send: vi.fn(),
  };

  reply.code.mockReturnValue(reply);
  reply.type.mockReturnValue(reply);
  reply.send.mockReturnValue(reply);

  return reply as unknown as FastifyReply & typeof reply;
}

describe('toProblem', () => {
  it('maps code, status, title, type, detail, instance and field errors', () => {
    const problem = toProblem(
      new ConflictError({
        message: 'internal',
        detail: 'Already exists.',
        errors: [{ field: 'key', code: 'DUPLICATE' }],
      }),
      'req-1',
    );

    expect(problem).toEqual({
      type: 'urn:fliposs:error:conflict',
      title: 'Conflict',
      status: 409,
      code: ErrorCode.Conflict,
      detail: 'Already exists.',
      instance: 'req-1',
      errors: [{ field: 'key', code: 'DUPLICATE' }],
    });
  });

  it('omits optional members that are not set', () => {
    const problem = toProblem(new NotFoundError({ message: 'x' }));

    expect(problem).toEqual({
      type: 'urn:fliposs:error:not-found',
      title: 'Not Found',
      status: 404,
      code: ErrorCode.NotFound,
    });
  });

  it('never serializes message, context, cause or stack', () => {
    const cause = new Error('duplicate key value violates unique constraint "flags_key_unique"');
    const problem = toProblem(
      new InternalError({
        message: 'insert into feature_flags failed',
        context: { table: 'feature_flags', constraint: 'flags_key_unique' },
        cause,
      }),
    );
    const wire = JSON.stringify(problem);

    expect(problem.detail).toBe('An unexpected error occurred.');
    expect(wire).not.toContain('feature_flags');
    expect(wire).not.toContain('flags_key_unique');
    expect(wire).not.toContain('unique constraint');
    expect(wire).not.toContain('stack');
  });
});

describe('sendAppError', () => {
  it('sets the status, the problem content type and the problem body', () => {
    const reply = mockReply();

    sendAppError(reply, new NotFoundError({ message: 'x', detail: 'Flag not found.' }), 'req-9');

    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.type).toHaveBeenCalledWith(PROBLEM_CONTENT_TYPE);
    expect(reply.send).toHaveBeenCalledWith({
      type: 'urn:fliposs:error:not-found',
      title: 'Not Found',
      status: 404,
      code: ErrorCode.NotFound,
      detail: 'Flag not found.',
      instance: 'req-9',
    });
  });
});
