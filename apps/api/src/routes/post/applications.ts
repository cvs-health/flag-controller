// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../types/preSerializedFromSchema.js';
import { applicationSchema } from '../../schemas/applications.js';
import { problemSchema } from '../../schemas/responses.js';

interface Reply {
  201: PreSerializedFromSchema<(typeof schema.response)[201]>;
  409: FromSchema<typeof problemSchema>;
}

const bodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string', pattern: '^[a-z0-9]+((-[a-z0-9]+){1,})?$' },
    description: { type: 'string' },
    teamId: { type: 'string' },
  },
  required: ['name', 'teamId'],
} as const;

const schema = {
  description: 'Creates a new application',
  body: bodySchema,
  response: {
    201: applicationSchema,
    409: problemSchema,
  },
  tags: ['applications'],
};

async function postApplications(fastify: FastifyInstance) {
  fastify.post<{ Body: FromSchema<typeof bodySchema>; Reply: Reply }>(
    '/applications',
    { schema },
    async (request, reply) => {
      const result = await fastify.services.applicationsService.createApplication(request.body, request.user.id);

      return reply.code(201).send(result);
    },
  );
}

export default postApplications;
