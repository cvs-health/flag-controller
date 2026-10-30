// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import { applicationSchemaJoined } from 'schemas/applications.js';

const paramsSchema = {
  type: 'object',
  properties: {
    applicationName: { type: 'string' },
  },
  required: ['applicationName'],
} as const;

const schema = {
  description: 'Gets an application by name',
  response: {
    200: applicationSchemaJoined,
  },
  params: paramsSchema,
  tags: ['applications'],
} as const;

async function getApplication(fastify: FastifyInstance) {
  fastify.get<{
    Params: FromSchema<typeof paramsSchema>;
  }>('/applications/:applicationName', { schema }, async (request, reply) => {
    const result = await fastify.services.applicationsService.getApplicationByName(request.params.applicationName);

    reply.code(200).send(result);
  });
}

export default getApplication;
