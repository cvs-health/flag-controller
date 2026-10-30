// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../../../../types/preSerializedFromSchema.js';

import { flagEnvironmentSchema, updateflagEnvironmentSchema } from 'schemas/flagEnvironments.js';
import type { problemSchema } from 'schemas/responses.js';

interface Reply {
  200: PreSerializedFromSchema<(typeof schema.response)[200]>;
  400: FromSchema<typeof problemSchema>;
  500: FromSchema<typeof problemSchema>;
}
const paramsSchema = {
  type: 'object',
  properties: {
    environmentId: { type: 'string' },
    featureFlagId: { type: 'string' },
  },
  required: ['environmentId', 'featureFlagId'],
} as const;
const schema = {
  description: 'Updates a flag environment',
  response: {
    200: flagEnvironmentSchema,
  },
  params: paramsSchema,
  body: updateflagEnvironmentSchema,
  tags: ['environments'],
} as const;

async function patchFlagEnvironment(fastify: FastifyInstance) {
  fastify.patch<{
    Body: FromSchema<typeof schema.body>;
    Reply: Reply;
    Params: FromSchema<typeof schema.params>;
  }>('/environments/:environmentId/feature-flags/:featureFlagId', { schema }, async (request, reply) => {
    const result = await fastify.services.flagEnvironmentsService.updateFlagEnvironment(
      request.params.featureFlagId,
      request.params.environmentId,
      request.body,
      request.user.id,
    );

    return reply.code(200).send(result);
  });
}

export default patchFlagEnvironment;
