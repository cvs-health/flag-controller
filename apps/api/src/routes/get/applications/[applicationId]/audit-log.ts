// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import type { PreSerializedFromSchema } from '../../../../types/preSerializedFromSchema.js';
import { logListItemSchema } from 'schemas/logs.js';
import type { logs } from 'db/schema/logs.js';
import { responseMetadataSchema } from 'schemas/responses.js';
import getFieldDirection from 'utils/getFieldDirection.js';

const paramsSchema = {
  type: 'object',
  properties: {
    applicationId: { type: 'string' },
  },
  required: ['applicationId'],
} as const;
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
const schema = {
  description: "Gets an application's audit log",
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
  tags: ['applications'],
} as const;

async function getApplicationAuditLog(fastify: FastifyInstance) {
  fastify.get<{
    Params: FromSchema<typeof paramsSchema>;
    Querystring: FromSchema<typeof querystringSchema>;
    Reply: PreSerializedFromSchema<(typeof schema.response)[200]>;
  }>('/applications/:applicationId/audit-log', { schema }, async (request, reply) => {
    const [field, direction] = getFieldDirection<typeof logs.$inferSelect>(request.query.sort);
    const result = await fastify.services.logsService.listLogs({
      filters: {
        and: {
          applicationIds: [request.params.applicationId],
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

export default getApplicationAuditLog;
