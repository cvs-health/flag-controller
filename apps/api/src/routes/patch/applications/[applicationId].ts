// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import { applicationSchema } from 'schemas/applications.js';
import { problemSchema } from 'schemas/responses.js';
import type { PreSerializedFromSchema } from '../../../types/preSerializedFromSchema.js';

interface Reply {
  200: PreSerializedFromSchema<(typeof schema.response)[200]>;
  400: FromSchema<typeof problemSchema>;
  404: FromSchema<typeof problemSchema>;
  500: FromSchema<typeof problemSchema>;
}

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
    description: { type: 'string' },
  },
  required: ['description'],
  additionalProperties: false,
} as const;

const schema = {
  description: 'Updates an application description',
  response: {
    200: applicationSchema,
    400: problemSchema,
    404: problemSchema,
    500: problemSchema,
  },
  params: paramsSchema,
  body: bodySchema,
  tags: ['applications'],
};

async function patchApplication(fastify: FastifyInstance) {
  fastify.patch<{
    Body: FromSchema<typeof bodySchema>;
    Reply: Reply;
    Params: FromSchema<typeof paramsSchema>;
  }>('/applications/:applicationId', { schema }, async (request, reply) => {
    const result = await fastify.services.applicationsService.updateApplication(
      request.params.applicationId,
      { description: request.body.description },
      request.user.id,
    );

    return reply.code(200).send(result);
  });
}

export default patchApplication;
