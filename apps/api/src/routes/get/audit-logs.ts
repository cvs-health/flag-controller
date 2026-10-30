// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../types/preSerializedFromSchema.js';
import { Scope } from 'shared-types';

import getFieldDirection from 'utils/getFieldDirection.js';
import type { logs } from 'db/schema/logs.js';
import { ColumnSortingDirection } from '../../types/common.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { actionTypesSchema, logListItemSchema, subjectTypesSchema } from 'schemas/logs.js';
import { environmentsSchema } from 'schemas/environments.js';
import { responseMetadataSchema } from 'schemas/responses.js';
import { resolveRequestApplicationIds } from 'utils/requestAccessContext.js';

const defaultSort = 'date:desc';
const querystringSchema = {
  type: 'object',
  properties: {
    actionEndDate: { type: 'string', format: 'date-time' },
    actionStartDate: { type: 'string', format: 'date-time' },
    actionType: actionTypesSchema,
    environmentKey: environmentsSchema,
    page: { type: 'number' },
    rows: { type: 'number' },
    scope: { type: 'string', enum: Object.values(Scope) },
    search: { type: 'string' },
    sort: {
      type: 'string',
      pattern: '^[a-zA-Z]+:(asc|desc)$',
      default: defaultSort,
    },
    subjectType: subjectTypesSchema,
  },
  required: ['page', 'rows'],
} as const;

const schema = {
  description: 'Get audit logs',
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
  tags: ['audit-logs'],
} as const;

async function getAuditLog(fastify: FastifyInstance) {
  fastify.get<{
    Querystring: FromSchema<typeof querystringSchema>;
    Reply: PreSerializedFromSchema<(typeof schema.response)[200]>;
  }>('/audit-logs', { schema }, async (request, reply) => {
    let applicationIds: string[] = [];

    if (request.query.scope === Scope.Me) {
      applicationIds = await resolveRequestApplicationIds(fastify, request);
    }

    const { page, rows, sort, ...filters } = request.query;
    const [field, direction] = getFieldDirection<typeof logs.$inferSelect>(sort);
    let environmentIds: string[] = [];

    if (filters.environmentKey?.length) {
      const environments = await fastify.services.environmentsService.listEnvironments({
        filters: {
          keys: filters.environmentKey,
        },
        pagination: {
          page: 1,
          rows: PAGINATION_NO_LIMIT,
        },
        sort: {
          field: 'key',
          direction: ColumnSortingDirection.ASC,
        },
      });

      environmentIds = environments.data.map((environment) => environment.id);
    }
    const result = await fastify.services.logsService.listLogs({
      filters: {
        and: {
          actionEndDate: filters.actionEndDate,
          actionStartDate: filters.actionStartDate,
          actionTypes: filters.actionType,
          applicationIds,
          environmentIds,
          search: filters.search,
          subjectTypes: filters.subjectType,
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

export default getAuditLog;
