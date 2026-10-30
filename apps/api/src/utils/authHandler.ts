// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';

import { auth } from '../auth.js';
import { InternalError } from '../errors/AppError.js';
import { sendAppError } from '../errors/problem.js';

async function authHandler(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const headers = fromNodeHeaders(request.headers);
    const req = new Request(url.toString(), {
      method: request.method,
      headers,
      ...(request.body ? { body: JSON.stringify(request.body) } : {}),
    });
    const response = await auth.handler(req);

    reply.status(response.status);
    response.headers.forEach((value, key) => {
      reply.header(key, value);
    });
    reply.send(response.body ? await response.text() : null);
  } catch (error) {
    fastify.log.error({ err: error, instance: request.id }, 'Authentication handler error');
    sendAppError(reply, new InternalError({ message: 'Authentication handler failed', cause: error }), request.id);
  }
}

export default authHandler;
