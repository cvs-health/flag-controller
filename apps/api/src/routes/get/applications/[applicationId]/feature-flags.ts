// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../../../types/preSerializedFromSchema.js';

import type { FeatureFlagsSelect } from 'repositories/featureFlagsRepository.js';
import { featureFlagWithEnvironmentListItemSchema } from 'schemas/featureFlags.js';
import { responseMetadataSchema } from 'schemas/responses.js';
import getFieldDirection from 'utils/getFieldDirection.js';

const querystringSchema = {
  type: 'object',
  properties: {
    archived: { type: 'boolean' },
    page: { type: 'number' },
    rows: { type: 'number' },
    search: { type: 'string' },
    sort: {
      type: 'string',
      pattern: '^[a-zA-Z]+:(asc|desc)$',
      default: 'key:asc',
    },
  },
  required: ['page', 'rows'],
} as const;

const paramsSchema = {
  type: 'object',
  properties: {
    applicationId: { type: 'string' },
  },
  required: ['applicationId'],
} as const;
const schema = {
  description: "Gets an application's feature flags",
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: featureFlagWithEnvironmentListItemSchema,
        },
        metadata: responseMetadataSchema,
      },
    },
  },
  querystring: querystringSchema,
  params: paramsSchema,
  tags: ['applications'],
} as const;

async function getApplicationFeatureFlags(fastify: FastifyInstance) {
  fastify.get<{
    Params: FromSchema<typeof paramsSchema>;
    Querystring: FromSchema<typeof querystringSchema>;
    Reply: PreSerializedFromSchema<(typeof schema.response)[200]>;
  }>('/applications/:applicationId/feature-flags', { schema }, async (request, reply) => {
    const [field, direction] = getFieldDirection<FeatureFlagsSelect>(request.query.sort);
    const payload = await fastify.services.featureFlagService.listFeatureFlags({
      filters: {
        applicationIds: [request.params.applicationId],
        archived: request.query.archived,
        search: request.query.search,
      },
      with: { environments: true },
      pagination: { page: request.query.page, rows: request.query.rows },
      sort: { field, direction },
    });

    return reply.code(200).send(payload);
  });
}

export default getApplicationFeatureFlags;
