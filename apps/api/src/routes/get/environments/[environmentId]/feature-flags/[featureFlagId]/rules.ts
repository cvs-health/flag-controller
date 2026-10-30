// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import { problemSchema } from 'schemas/responses.js';
import { ruleSchema } from 'schemas/rules.js';
import { ColumnSortingDirection } from '../../../../../../types/common.js';
import { PAGINATION_NO_LIMIT } from '../../../../../../constants/pagination.js';
import type { RuleReply } from '../../../../../../types/ruleReply.js';

const paramsSchema = {
  type: 'object',
  properties: {
    environmentId: { type: 'string' },
    featureFlagId: { type: 'string' },
  },
  required: ['environmentId', 'featureFlagId'],
} as const;

const schema = {
  description: "Gets an environment's feature flag rules",
  response: {
    200: {
      type: 'array',
      items: ruleSchema,
    },
    404: problemSchema,
  },
  params: paramsSchema,
  tags: ['environments'],
} as const;

interface Reply {
  200: RuleReply[];
  404: FromSchema<typeof problemSchema>;
  500: FromSchema<typeof problemSchema>;
}

async function getEnvironmentFeatureFlagRules(fastify: FastifyInstance) {
  fastify.get<{
    Reply: Reply;
    Params: FromSchema<typeof paramsSchema>;
  }>('/environments/:environmentId/feature-flags/:featureFlagId/rules', { schema }, async (request, reply) => {
    const result = await fastify.services.rulesService.listRules({
      filters: { environmentIds: [request.params.environmentId], flagIds: [request.params.featureFlagId] },
      sort: { field: 'orderPosition', direction: ColumnSortingDirection.ASC },
      pagination: { rows: PAGINATION_NO_LIMIT, page: 1 },
    });

    reply.code(200).send(result.data);
  });
}

export default getEnvironmentFeatureFlagRules;
