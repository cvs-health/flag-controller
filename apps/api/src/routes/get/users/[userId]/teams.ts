// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import { problemSchema, responseMetadataSchema } from 'schemas/responses.js';
import { PAGINATION_NO_LIMIT } from '../../../../constants/pagination.js';
import { ValidationError } from '../../../../errors/AppError.js';
import { ColumnSortingDirection } from '../../../../types/common.js';

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
    organizationId: { type: 'string' },
  },
} as const;
const schema = {
  description: "Gets a user's teams",
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
    400: problemSchema,
  },
  tags: ['users'],
} as const;

async function getUserTeams(fastify: FastifyInstance) {
  fastify.get<{
    Params: FromSchema<typeof paramsSchema>;
  }>('/users/:userId/teams', { schema }, async (request, reply) => {
    const organizationId = request.user.organizationId;
    if (!organizationId) {
      throw new ValidationError({ message: 'No active organization', detail: 'No active organization.' });
    }

    const result = await fastify.services.teamsService.listTeams({
      filters: {
        organizationId,
        userId: request.params.userId,
      },
      pagination: {
        page: 1,
        rows: PAGINATION_NO_LIMIT,
      },
      sort: {
        field: 'updatedAt',
        direction: ColumnSortingDirection.DESC,
      },
    });
    reply.code(200).send(result);
  });
}

export default getUserTeams;
