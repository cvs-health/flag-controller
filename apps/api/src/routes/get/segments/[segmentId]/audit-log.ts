// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import type { PreSerializedFromSchema } from '../../../../types/preSerializedFromSchema.js';
import getFieldDirection from 'utils/getFieldDirection.js';
import type { logs } from 'db/schema/logs.js';
import { ColumnSortingDirection } from '../../../../types/common.js';
import { PAGINATION_NO_LIMIT } from '../../../../constants/pagination.js';
import { logListItemSchema } from 'schemas/logs.js';
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
    segmentId: { type: 'string' },
  },
  required: ['segmentId'],
} as const;
const schema = {
  description: "Gets a segment's audit log",
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
  tags: ['segments'],
} as const;

async function getSegmentAuditLog(fastify: FastifyInstance) {
  fastify.get<{
    Params: FromSchema<typeof paramsSchema>;
    Querystring: FromSchema<typeof querystringSchema>;
    Reply: PreSerializedFromSchema<(typeof schema.response)[200]>;
  }>('/segments/:segmentId/audit-log', { schema }, async (request, reply) => {
    const [field, direction] = getFieldDirection<typeof logs.$inferSelect>(request.query.sort);
    const segment = await fastify.services.segmentsService.getSegmentById(request.params.segmentId);
    const rules = await fastify.services.rulesService.listRules({
      filters: {
        segmentIds: [segment.id],
      },
      pagination: {
        page: 1,
        rows: PAGINATION_NO_LIMIT,
      },
      sort: {
        direction: ColumnSortingDirection.ASC,
        field: 'key',
      },
    });
    const ruleIds = rules.data.map((rule) => rule.id);
    const subjectIds = [segment.id, ...ruleIds];
    const result = await fastify.services.logsService.listLogs({
      filters: {
        and: {
          applicationIds: [segment.applicationId],
          subjectIds,
        },
      },
      pagination: {
        page: request.query.page,
        rows: request.query.rows,
      },
      sort: {
        direction,
        field,
      },
    });

    reply.code(200).send(result);
  });
}

export default getSegmentAuditLog;
