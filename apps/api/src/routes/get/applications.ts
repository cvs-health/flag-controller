// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import { responseMetadataSchema } from 'schemas/responses.js';
import { Scope } from 'shared-types';
import { auth } from '../../auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import { ColumnSortingDirection } from '../../types/common.js';

const querystringSchema = {
  type: 'object',
  properties: {
    page: { type: 'number' },
    rows: { type: 'number' },
    scope: { type: 'string', enum: Object.values(Scope) },
  },
  required: ['page', 'rows'],
} as const;
const items = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    team: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
    },
  },
} as const;
const schema = {
  description: 'Gets all applications',
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
  tags: ['applications'],
} as const;

async function getApplications(fastify: FastifyInstance) {
  fastify.get<{
    Querystring: FromSchema<typeof querystringSchema>;
  }>('/applications', { schema }, async (request, reply) => {
    let teamIds: string[] = [];

    if (request.query.scope === Scope.Me) {
      const teams = await auth.api.listUserTeams({ headers: fromNodeHeaders(request.headers) });

      teamIds = teams.map((team) => team.id);
    }

    const result = await fastify.services.applicationsService.listApplications({
      filters: {
        teamIds: teamIds.length ? teamIds : undefined,
      },
      pagination: {
        page: request.query.page,
        rows: request.query.rows,
      },
      sort: {
        direction: ColumnSortingDirection.ASC,
        field: 'name',
      },
      with: {
        teams: true,
      },
    });

    reply.code(200).send(result);
  });
}

export default getApplications;
