// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import { responseMetadataSchema } from 'schemas/responses.js';
import { ColumnSortingDirection } from '../../types/common.js';

const querystringSchema = {
  type: 'object',
  properties: {
    page: { type: 'number' },
    rows: { type: 'number' },
  },
  required: ['page', 'rows'],
} as const;
const items = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    applications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
  },
  required: ['id', 'name', 'applications'],
} as const;
const schema = {
  description: 'Gets all teams',
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items,
        },
        metadata: responseMetadataSchema,
      },
    },
  },
  querystring: querystringSchema,
  tags: ['teams'],
} as const;

async function getTeams(fastify: FastifyInstance) {
  fastify.get<{
    Querystring: FromSchema<typeof querystringSchema>;
  }>('/teams', { schema }, async (request, reply) => {
    const result = await fastify.services.teamsService.listTeams({
      pagination: {
        page: request.query.page,
        rows: request.query.rows,
      },
      sort: {
        field: 'name',
        direction: ColumnSortingDirection.ASC,
      },
      with: {
        applications: true,
      },
    });

    reply.code(200).send(result);
  });
}

export default getTeams;
