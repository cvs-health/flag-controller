// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import { featureFlagSchemaJoined, updateFeatureFlagSchema } from 'schemas/featureFlags.js';
import type { problemSchema } from 'schemas/responses.js';
import type { PreSerializedFromSchema } from '../../../types/preSerializedFromSchema.js';

interface Reply {
  200: PreSerializedFromSchema<(typeof schema.response)[200]>;
  400: FromSchema<typeof problemSchema>;
  500: FromSchema<typeof problemSchema>;
}
const paramsSchema = {
  type: 'object',
  properties: {
    featureFlagId: { type: 'string' },
  },
  required: ['featureFlagId'],
} as const;
const schema = {
  description: 'Updates a feature flag',
  response: {
    200: featureFlagSchemaJoined,
  },
  params: paramsSchema,
  body: updateFeatureFlagSchema,
  tags: ['feature-flags'],
} as const;

async function patchFeatureFlag(fastify: FastifyInstance) {
  fastify.patch<{
    Body: FromSchema<typeof schema.body>;
    Reply: Reply;
    Params: FromSchema<typeof schema.params>;
  }>('/feature-flags/:featureFlagId', { schema }, async (request, reply) => {
    const result = await fastify.services.featureFlagService.updateFeatureFlag(
      request.params.featureFlagId,
      request.body,
      request.user.id,
    );

    return reply.code(200).send(result);
  });
}

export default patchFeatureFlag;
