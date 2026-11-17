// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';

import { ErrorCode } from 'shared-types';

import { auth } from '../auth.js';
import { IdentityManagedError, InternalError } from '../errors/AppError.js';
import { sendAppError } from '../errors/problem.js';

/** The message Better Auth carries when an identity hook refused the write, or undefined for any other response. */
async function identityManagedRefusal(response: Response) {
  if (response.status !== 403 || !response.headers.get('content-type')?.includes('json')) {
    return undefined;
  }

  const body = await response
    .clone()
    .json()
    .catch(() => undefined);

  if (typeof body !== 'object' || body === null || !('code' in body) || body.code !== ErrorCode.IdentityManaged) {
    return undefined;
  }

  return 'message' in body && typeof body.message === 'string' ? body.message : '';
}

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

    // Answer an identity-mode refusal with the same problem document the API's own routes send.
    const refusal = await identityManagedRefusal(response);
    if (refusal !== undefined) {
      sendAppError(
        reply,
        new IdentityManagedError({
          message: `Better Auth refused ${request.method} ${url.pathname}: the identity provider owns it`,
          detail: refusal || undefined,
        }),
        request.id,
      );
      return;
    }

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
