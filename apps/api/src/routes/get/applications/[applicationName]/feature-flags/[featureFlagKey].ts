// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import { featureFlagSchemaJoined } from 'schemas/featureFlags.js';

const paramsSchema = {
  type: 'object',
  properties: {
    applicationName: { type: 'string' },
    featureFlagKey: { type: 'string' },
  },
  required: ['applicationName', 'featureFlagKey'],
} as const;

const schema = {
  description: "Gets an application's feature flag",
  response: {
    200: featureFlagSchemaJoined,
  },
  params: paramsSchema,
  tags: ['applications'],
} as const;

async function getApplicationFeatureFlag(fastify: FastifyInstance) {
  fastify.get<{
    Params: FromSchema<typeof paramsSchema>;
  }>('/applications/:applicationName/feature-flags/:featureFlagKey', { schema }, async (request, reply) => {
    const result = await fastify.services.featureFlagService.getFeatureFlagByApplicationNameAndKey(
      request.params.applicationName,
      request.params.featureFlagKey,
    );

    reply.code(200).send(result);
  });
}

export default getApplicationFeatureFlag;
