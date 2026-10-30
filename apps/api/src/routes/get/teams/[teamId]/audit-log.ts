// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import { SubjectType } from 'shared-types';

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
    search: { type: 'string' },
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
    teamId: { type: 'string' },
  },
  required: ['teamId'],
} as const;
const schema = {
  description: "Gets a team's audit log",
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
  tags: ['teams'],
} as const;

async function getTeamAuditLog(fastify: FastifyInstance) {
  fastify.get<{
    Querystring: FromSchema<typeof querystringSchema>;
    Reply: PreSerializedFromSchema<(typeof schema.response)[200]>;
    Params: FromSchema<typeof paramsSchema>;
  }>('/teams/:teamId/audit-log', { schema }, async (request, reply) => {
    const [field, direction] = getFieldDirection<typeof logs.$inferSelect>(request.query.sort);
    const applicationsResult = await fastify.services.applicationsService.listApplications({
      filters: {
        teamIds: [request.params.teamId],
      },
      pagination: {
        page: 1,
        rows: PAGINATION_NO_LIMIT,
      },
      sort: {
        field: 'name',
        direction: ColumnSortingDirection.ASC,
      },
    });
    const applicationIds = applicationsResult.data.map((app) => app.id);

    const result = await fastify.services.logsService.listLogs({
      filters: {
        and: { search: request.query.search },
        or: [
          ...(applicationIds.length ? [{ applicationIds }] : []),
          {
            subjectTypes: [SubjectType.Team],
            subjectIds: [request.params.teamId],
          },
        ],
      },
      pagination: { page: request.query.page, rows: request.query.rows },
      sort: { field, direction },
    });

    reply.code(200).send(result);
  });
}

export default getTeamAuditLog;
