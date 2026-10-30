// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import { responseMetadataSchema } from 'schemas/responses.js';
import { ColumnSortingDirection } from '../../../../types/common.js';
import { userSchema } from 'schemas/users.js';

const querystringSchema = {
  type: 'object',
  properties: {
    page: { type: 'number' },
    rows: { type: 'number' },
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
  description: "Gets a team's members",
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: userSchema,
        },
        metadata: responseMetadataSchema,
      },
    },
  },
  params: paramsSchema,
  querystring: querystringSchema,
  tags: ['teams'],
} as const;

async function getTeamMembers(fastify: FastifyInstance) {
  fastify.get<{
    Params: FromSchema<typeof paramsSchema>;
    Querystring: FromSchema<typeof querystringSchema>;
  }>('/teams/:teamId/members', { schema }, async (request, reply) => {
    const result = await fastify.services.teamsService.listMembers({
      filters: {
        teamIds: [request.params.teamId],
      },
      pagination: {
        page: request.query.page,
        rows: request.query.rows,
      },
      sort: { direction: ColumnSortingDirection.ASC, field: 'name' },
    });

    reply.code(200).send(result);
  });
}

export default getTeamMembers;
