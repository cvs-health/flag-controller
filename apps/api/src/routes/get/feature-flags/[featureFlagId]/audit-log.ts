// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import type { PreSerializedFromSchema } from '../../../../types/preSerializedFromSchema.js';
import getFieldDirection from 'utils/getFieldDirection.js';
import { ColumnSortingDirection } from '../../../../types/common.js';
import { PAGINATION_NO_LIMIT } from '../../../../constants/pagination.js';
import { logListItemSchema } from 'schemas/logs.js';
import type { logs } from 'db/schema/logs.js';
import { responseMetadataSchema } from 'schemas/responses.js';

const querystringSchema = {
  type: 'object',
  properties: {
    page: { type: 'number' },
    rows: { type: 'number' },
    sort: {
      type: 'string',
      pattern: '^[a-zA-Z]+:(asc|desc)$',
      default: 'createdAt:desc',
    },
  },
  required: ['page', 'rows'],
} as const;
const paramsSchema = {
  type: 'object',
  properties: {
    featureFlagId: { type: 'string' },
  },
  required: ['featureFlagId'],
} as const;
const schema = {
  description: "Gets a feature flag's audit log",
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: logListItemSchema,
        },
        metadata: responseMetadataSchema,
      },
    },
  },
  querystring: querystringSchema,
  params: paramsSchema,
  tags: ['feature-flags'],
} as const;

async function getFeatureFlagAuditLog(fastify: FastifyInstance) {
  fastify.get<{
    Params: FromSchema<typeof paramsSchema>;
    Querystring: FromSchema<typeof querystringSchema>;
    Reply: PreSerializedFromSchema<(typeof schema.response)[200]>;
  }>('/feature-flags/:featureFlagId/audit-log', { schema }, async (request, reply) => {
    const [field, direction] = getFieldDirection<typeof logs.$inferSelect>(request.query.sort);
    const [featureFlag, rules, variations] = await Promise.all([
      fastify.services.featureFlagService.getFeatureFlagById(request.params.featureFlagId),
      fastify.services.rulesService.listRules({
        filters: {
          flagIds: [request.params.featureFlagId],
        },
        pagination: {
          page: 1,
          rows: PAGINATION_NO_LIMIT,
        },
        sort: {
          field: 'key',
          direction: ColumnSortingDirection.ASC,
        },
      }),
      fastify.services.variationsService.listVariations({
        filters: {
          flagIds: [request.params.featureFlagId],
        },
        pagination: {
          page: 1,
          rows: PAGINATION_NO_LIMIT,
        },
        sort: {
          field: 'key',
          direction: ColumnSortingDirection.ASC,
        },
      }),
    ]);

    const ruleIds = rules.data.map((rule) => rule.id);
    const variationIds = variations.data.map((variation) => variation.id);
    const subjectIds = new Set([...ruleIds, ...variationIds, featureFlag.id]);
    const result = await fastify.services.logsService.listLogs({
      filters: {
        and: {
          subjectIds: Array.from(subjectIds),
          applicationIds: [featureFlag.applicationId],
        },
      },
      pagination: {
        page: request.query.page,
        rows: request.query.rows,
      },
      sort: {
        field,
        direction,
      },
    });

    reply.code(200).send(result);
  });
}

export default getFeatureFlagAuditLog;
