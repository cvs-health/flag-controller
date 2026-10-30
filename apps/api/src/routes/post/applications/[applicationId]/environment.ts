// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import { EnvironmentKey } from 'shared-types';

const paramsSchema = {
  type: 'object',
  properties: {
    applicationId: { type: 'string' },
  },
  required: ['applicationId'],
} as const;

const bodySchema = {
  type: 'object',
  properties: {
    key: { type: 'string', enum: Object.values(EnvironmentKey) },
  },
  required: ['key'],
} as const;

const schema = {
  description: 'Creates a new environment for an application',
  params: paramsSchema,
  body: bodySchema,
  tags: ['applications'],
} as const;

async function postEnvironment(fastify: FastifyInstance) {
  fastify.post<{
    Params: FromSchema<typeof paramsSchema>;
    Body: FromSchema<typeof bodySchema>;
  }>('/applications/:applicationId/environment', { schema }, async (request, reply) => {
    const result = await fastify.services.environmentsService.createEnvironment(
      {
        applicationId: request.params.applicationId,
        key: request.body.key,
      },
      request.user.id,
    );

    return reply.code(201).send(result);
  });
}

export default postEnvironment;
