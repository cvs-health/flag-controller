// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import { fromNodeHeaders } from 'better-auth/node';

import { ColumnSortingDirection } from '../../../../types/common.js';
import { PAGINATION_NO_LIMIT } from '../../../../constants/pagination.js';
import { auth } from '../../../../auth.js';
import { responseMetadataSchema } from 'schemas/responses.js';

const paramsSchema = {
  type: 'object',
  properties: {
    userId: { type: 'string' },
  },
  required: ['userId'],
} as const;
const items = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
  },
} as const;
const schema = {
  description: "Gets a user's applications",
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
  tags: ['users'],
} as const;

async function getUserApplications(fastify: FastifyInstance) {
  fastify.get<{
    Params: FromSchema<typeof paramsSchema>;
  }>('/users/:userId/applications', { schema }, async (request, reply) => {
    const teams = await auth.api.listUserTeams({ headers: fromNodeHeaders(request.headers) });
    const teamIds = teams.map((team) => team.id);
    const result = await fastify.services.applicationsService.listApplications({
      filters: {
        teamIds,
      },
      pagination: {
        page: 1,
        rows: PAGINATION_NO_LIMIT,
      },
      sort: {
        direction: ColumnSortingDirection.ASC,
        field: 'name',
      },
    });

    reply.code(200).send(result);
  });
}

export default getUserApplications;
