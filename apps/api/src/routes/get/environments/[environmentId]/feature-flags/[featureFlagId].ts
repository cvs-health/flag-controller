// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../../../../types/preSerializedFromSchema.js';

import { type problemSchema, responseMetadataSchema } from 'schemas/responses.js';
import { flagEnvironmentSchemaJoined } from 'schemas/flagEnvironments.js';

const paramsSchema = {
  type: 'object',
  properties: {
    environmentId: { type: 'string' },
    featureFlagId: { type: 'string' },
  },
  required: ['environmentId', 'featureFlagId'],
} as const;

const schema = {
  description: 'Gets a flag environment',
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: flagEnvironmentSchemaJoined,
        },
        metadata: responseMetadataSchema,
      },
    },
  },
  params: paramsSchema,
  tags: ['environments'],
} as const;

interface Reply {
  200: PreSerializedFromSchema<(typeof schema.response)[200]>;
  404: FromSchema<typeof problemSchema>;
  500: FromSchema<typeof problemSchema>;
}

async function getEnvironmentFeatureFlag(fastify: FastifyInstance) {
  fastify.get<{
    Reply: Reply;
    Params: FromSchema<typeof paramsSchema>;
  }>('/environments/:environmentId/feature-flags/:featureFlagId', { schema }, async (request, reply) => {
    const result = await fastify.services.flagEnvironmentsService.getFlagEnvironment(
      request.params.featureFlagId,
      request.params.environmentId,
    );

    reply.code(200).send(result);
  });
}

export default getEnvironmentFeatureFlag;
