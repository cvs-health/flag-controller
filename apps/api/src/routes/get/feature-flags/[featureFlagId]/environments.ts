// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../../../types/preSerializedFromSchema.js';

import { ColumnSortingDirection } from '../../../../types/common.js';
import { PAGINATION_NO_LIMIT } from '../../../../constants/pagination.js';
import { problemSchema } from 'schemas/responses.js';
import { flagEnvironmentSchemaJoined } from 'schemas/flagEnvironments.js';

interface Reply {
  200: PreSerializedFromSchema<(typeof schema.response)[200]>;
  404: FromSchema<typeof problemSchema>;
  500: FromSchema<typeof problemSchema>;
}

const paramsSchema = {
  type: 'object',
  properties: {
    featureFlagId: { type: 'string' },
  },
  required: ['featureFlagId'],
} as const;
const responseSchema = {
  type: 'array',
  items: flagEnvironmentSchemaJoined,
} as const;

const schema = {
  description: "Gets a feature flag's environments",
  response: {
    200: responseSchema,
    500: problemSchema,
  },
  params: paramsSchema,
  tags: ['feature-flags'],
};

async function getFeatureFlagEnvironments(fastify: FastifyInstance) {
  fastify.get<{
    Reply: Reply;
    Params: FromSchema<typeof paramsSchema>;
  }>('/feature-flags/:featureFlagId/environments', { schema }, async (request, reply) => {
    const rows = await fastify.services.flagEnvironmentsService.listFlagEnvironments({
      filters: { flagIds: [request.params.featureFlagId] },
      pagination: { rows: PAGINATION_NO_LIMIT, page: 1 },
      sort: { field: 'environmentKey', direction: ColumnSortingDirection.ASC },
    });

    reply.code(200).send(rows.data);
  });
}

export default getFeatureFlagEnvironments;
