// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../types/preSerializedFromSchema.js';

import type { FeatureFlagsJoined } from 'repositories/featureFlagsRepository.js';
import { environmentsSchema } from 'schemas/environments.js';
import { featureFlagTypesSchema, featureFlagWithEnvironmentListItemSchema } from 'schemas/featureFlags.js';
import { problemSchema, responseMetadataSchema } from 'schemas/responses.js';
import getFieldDirection from 'utils/getFieldDirection.js';
import { resolveRequestApplicationIds } from 'utils/requestAccessContext.js';

interface Reply {
  200: PreSerializedFromSchema<(typeof schema.response)[200]>;
  400: FromSchema<typeof problemSchema>;
  500: FromSchema<typeof problemSchema>;
}

const querystringSchema = {
  type: 'object',
  properties: {
    archived: { type: 'boolean' },
    createdAtEndDate: { type: 'string', format: 'date-time' },
    createdAtStartDate: { type: 'string', format: 'date-time' },
    enabled: { type: 'boolean' },
    environmentKey: environmentsSchema,
    featureFlagTypes: featureFlagTypesSchema,
    updatedAtEndDate: { type: 'string', format: 'date-time' },
    updatedAtStartDate: { type: 'string', format: 'date-time' },
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
const schema = {
  description: 'Gets all feature flags with environment status.',
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
    400: problemSchema,
  },
  querystring: querystringSchema,
  tags: ['feature-flags'],
} as const;

async function getFeatureFlags(fastify: FastifyInstance) {
  fastify.get<{
    Reply: Reply;
    Querystring: FromSchema<typeof querystringSchema>;
  }>('/feature-flags', { schema }, async (request, reply) => {
    const applicationIds = await resolveRequestApplicationIds(fastify, request);
    const [field, direction] = getFieldDirection<FeatureFlagsJoined>(request.query.sort);
    const featureFlagsResult = await fastify.services.featureFlagService.listFeatureFlags({
      filters: {
        applicationIds,
        archived: request.query.archived,
        createdAtEndDate: request.query.createdAtEndDate,
        createdAtStartDate: request.query.createdAtStartDate,
        enabled: request.query.enabled,
        environmentKeys: request.query.environmentKey,
        featureFlagTypes: request.query.featureFlagTypes,
        search: request.query.search,
        updatedAtEndDate: request.query.updatedAtEndDate,
        updatedAtStartDate: request.query.updatedAtStartDate,
      },
      with: {
        environments: true,
      },
      pagination: { page: request.query.page, rows: request.query.rows },
      sort: { field, direction },
    });

    return reply.code(200).send(featureFlagsResult);
  });
}

export default getFeatureFlags;
