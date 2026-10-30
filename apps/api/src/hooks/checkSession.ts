// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyRequest } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';

import { auth } from '../auth.js';
import { UnauthorizedError } from '../errors/AppError.js';
import routeWhitelisted from 'utils/routeWhitelisted.js';

/** Attaches the session user to the request. Throws so the central handler owns the 401 body. */
async function checkSession(request: FastifyRequest) {
  // We don't check session for these routes
  if (routeWhitelisted(request.raw.url)) {
    return;
  }

  const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });

  if (!session) {
    throw new UnauthorizedError({ context: { url: request.raw.url } });
  }

  request.user = {
    email: session.user?.email,
    id: session.user?.id,
    name: session.user?.name,
    organizationId: session.session?.activeOrganizationId ?? null,
  };
}

export default checkSession;
