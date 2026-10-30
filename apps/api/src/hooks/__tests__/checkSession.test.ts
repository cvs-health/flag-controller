// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import Fastify from 'fastify';
import { ErrorCode, PROBLEM_CONTENT_TYPE } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import { handleRouteError } from '../../utils/errorHandler.js';
import checkSession from '../checkSession.js';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock('../../auth.js', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mocks.getSession(...args),
    },
  },
}));

describe('checkSession', () => {
  const mockUser = {
    id: 'user-123',
    email: 'jane@example.com',
    name: 'Jane Doe',
  };

  it('attaches the user to the request when the session is valid', async () => {
    mocks.getSession.mockResolvedValueOnce({ user: mockUser, session: { activeOrganizationId: 'org-123' } });

    const fastify = Fastify();

    fastify.addHook('preHandler', checkSession);
    fastify.get('/test', async (request, _reply) => {
      return request.user;
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/test',
    });

    fastify.close();

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      email: mockUser.email,
      id: mockUser.id,
      name: mockUser.name,
      organizationId: 'org-123',
    });
  });

  it('returns a 401 problem when the session is invalid or missing', async () => {
    mocks.getSession.mockResolvedValueOnce(null);

    const fastify = Fastify();
    fastify.setErrorHandler(handleRouteError);
    fastify.addHook('preHandler', checkSession);
    fastify.get('/test', async (request, _reply) => {
      return request.user;
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/test',
    });

    fastify.close();

    expect(response.statusCode).toBe(401);
    expect(response.headers['content-type']).toContain(PROBLEM_CONTENT_TYPE);
    expect(JSON.parse(response.body)).toMatchObject({
      status: 401,
      code: ErrorCode.Unauthorized,
      title: 'Unauthorized',
      detail: 'Authentication is required.',
    });
  });

  it('surfaces an error when the session lookup rejects', async () => {
    mocks.getSession.mockRejectedValueOnce(new Error('better-auth unavailable'));

    const fastify = Fastify();
    fastify.addHook('preHandler', checkSession);
    fastify.get('/test', async (request, _reply) => {
      return request.user;
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/test',
    });

    fastify.close();

    expect(response.statusCode).toBe(500);
  });
});
