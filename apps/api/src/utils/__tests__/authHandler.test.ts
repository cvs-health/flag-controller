// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import Fastify from 'fastify';
import { ErrorCode, PROBLEM_CONTENT_TYPE } from 'shared-types';
import authHandler from '../authHandler.js';

const mocks = vi.hoisted(() => ({
  handler: vi.fn(),
}));

vi.mock('../../auth.js', () => ({
  auth: {
    handler: mocks.handler,
  },
}));

describe('authHandler', () => {
  it('handles the request', async () => {
    mocks.handler.mockResolvedValue({
      status: 200,
      headers: new Headers(),
      body: null,
    });
    const fastify = Fastify();
    const request = {
      url: '/api/auth/session',
      method: 'POST',
      headers: { host: 'localhost:3001' },
      body: { username: 'test', password: 'password' },
    };
    const reply = {
      status: vi.fn(),
      header: vi.fn(),
      send: vi.fn(),
    };

    // @ts-expect-error We don't need the entire request
    await authHandler(fastify, request, reply);

    expect(reply.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(reply.send).toHaveBeenCalledExactlyOnceWith(null);
  });

  it('handles an authentication error', async () => {
    mocks.handler.mockImplementation(() => {
      throw new Error('Authentication failed');
    });
    const fastify = Fastify();
    const request = {
      id: 'req-1',
      url: '/api/auth/session',
      method: 'POST',
      headers: { host: 'localhost:3001' },
      body: { username: 'test', password: 'password' },
    };
    const reply = {
      code: vi.fn(),
      type: vi.fn(),
      status: vi.fn(),
      header: vi.fn(),
      send: vi.fn(),
    };
    reply.code.mockReturnValue(reply);
    reply.type.mockReturnValue(reply);

    // @ts-expect-error We don't need the entire request
    await authHandler(fastify, request, reply);

    expect(reply.code).toHaveBeenCalledExactlyOnceWith(500);
    expect(reply.type).toHaveBeenCalledExactlyOnceWith(PROBLEM_CONTENT_TYPE);
    expect(reply.send).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ status: 500, code: ErrorCode.Internal, instance: 'req-1' }),
    );
    expect(JSON.stringify(reply.send.mock.calls[0]?.[0])).not.toContain('Authentication failed');
  });

  describe('identity-mode refusals from Better Auth', () => {
    function fakeReply() {
      const reply = { code: vi.fn(), type: vi.fn(), status: vi.fn(), header: vi.fn(), send: vi.fn() };
      reply.code.mockReturnValue(reply);
      reply.type.mockReturnValue(reply);
      return reply;
    }
    const createTeam = {
      id: 'req-7',
      url: '/api/auth/organization/create-team',
      method: 'POST',
      headers: { host: 'localhost:8080' },
      body: { name: 'payments-platform' },
    };

    it('answers with the IDENTITY_MANAGED problem document', async () => {
      mocks.handler.mockResolvedValue(
        new Response(
          JSON.stringify({ code: 'IDENTITY_MANAGED', message: 'Teams are managed by your identity provider.' }),
          { status: 403, headers: { 'content-type': 'application/json' } },
        ),
      );
      const reply = fakeReply();

      // @ts-expect-error We don't need the entire request
      await authHandler(Fastify(), createTeam, reply);

      expect(reply.code).toHaveBeenCalledExactlyOnceWith(403);
      expect(reply.type).toHaveBeenCalledExactlyOnceWith(PROBLEM_CONTENT_TYPE);
      expect(reply.send).toHaveBeenCalledExactlyOnceWith({
        type: 'urn:fliposs:error:identity-managed',
        title: 'Managed by Identity Provider',
        status: 403,
        code: ErrorCode.IdentityManaged,
        detail: 'Teams are managed by your identity provider.',
        instance: 'req-7',
      });
    });

    it('passes any other Better Auth 403 through unchanged', async () => {
      const body = JSON.stringify({
        code: 'YOU_ARE_NOT_ALLOWED_TO_CREATE_TEAMS_IN_THIS_ORGANIZATION',
        message: 'Forbidden',
      });
      mocks.handler.mockResolvedValue(
        new Response(body, { status: 403, headers: { 'content-type': 'application/json' } }),
      );
      const reply = fakeReply();

      // @ts-expect-error We don't need the entire request
      await authHandler(Fastify(), createTeam, reply);

      expect(reply.status).toHaveBeenCalledExactlyOnceWith(403);
      expect(reply.send).toHaveBeenCalledExactlyOnceWith(body);
      expect(reply.type).not.toHaveBeenCalled();
    });
  });
});
