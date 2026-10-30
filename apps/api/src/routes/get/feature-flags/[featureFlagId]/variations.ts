// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../../../types/preSerializedFromSchema.js';

import { problemSchema } from 'schemas/responses.js';
import { PAGINATION_NO_LIMIT } from '../../../../constants/pagination.js';
import { ColumnSortingDirection } from '../../../../types/common.js';
import { variationSchema } from '../../../../schemas/variations.js';

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
  items: variationSchema,
} as const;

const schema = {
  description: "Gets a feature flag's variations",
  response: {
    200: responseSchema,
    404: problemSchema,
    500: problemSchema,
  },
  params: paramsSchema,
  tags: ['feature-flags'],
};

async function getFeatureFlagVariations(fastify: FastifyInstance) {
  fastify.get<{
    Reply: Reply;
    Params: FromSchema<typeof paramsSchema>;
  }>('/feature-flags/:featureFlagId/variations', { schema }, async (request, reply) => {
    const rows = await fastify.services.variationsService.listVariations({
      filters: { flagIds: [request.params.featureFlagId] },
      pagination: { rows: PAGINATION_NO_LIMIT, page: 1 },
      sort: { field: 'key', direction: ColumnSortingDirection.ASC },
    });

    reply.code(200).send(rows.data);
  });
}

export default getFeatureFlagVariations;
