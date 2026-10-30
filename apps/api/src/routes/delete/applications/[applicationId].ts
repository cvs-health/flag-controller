// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

interface Reply {
  204: undefined;
}

const paramsSchema = {
  type: 'object',
  properties: {
    applicationId: { type: 'string' },
  },
  required: ['applicationId'],
} as const;

const schema = {
  description: 'Deletes an application by ID',
  response: {
    204: {},
  },
  params: paramsSchema,
  tags: ['applications'],
};

async function deleteApplication(fastify: FastifyInstance) {
  fastify.delete<{
    Reply: Reply;
    Params: FromSchema<typeof paramsSchema>;
  }>('/applications/:applicationId', { schema }, async (request, reply) => {
    await fastify.services.applicationsService.deleteApplication(request.params.applicationId, request.user.id);

    return reply.code(204).send();
  });
}

export default deleteApplication;
