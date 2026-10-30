// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';

import authHandler from 'utils/authHandler.js';

async function getApiAuth(fastify: FastifyInstance) {
  fastify.get('/api/auth/*', (request, reply) => authHandler(fastify, request, reply));
}

export default getApiAuth;
