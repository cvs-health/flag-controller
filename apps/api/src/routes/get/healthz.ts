// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';

const schema = {
  description: 'Health check endpoint',
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string' },
      },
    },
  },
  tags: ['health'],
} as const;

async function getHealthz(fastify: FastifyInstance) {
  fastify.get('/healthz', { schema }, async (_request, reply) => {
    console.log('Health check endpoint hit');
    reply.code(200).send({ status: 'ok' });
  });
}

export default getHealthz;
