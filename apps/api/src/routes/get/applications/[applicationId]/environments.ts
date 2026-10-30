// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../../../types/preSerializedFromSchema.js';

import { ColumnSortingDirection } from '../../../../types/common.js';
import { PAGINATION_NO_LIMIT } from '../../../../constants/pagination.js';
import { environmentSchema } from 'schemas/environments.js';

const paramsSchema = {
  type: 'object',
  properties: {
    applicationId: { type: 'string' },
  },
  required: ['applicationId'],
} as const;

const schema = {
  description: "Gets an application's environments by application ID",
  response: {
    200: {
      type: 'array',
      items: environmentSchema,
    },
  },
  params: paramsSchema,
  tags: ['applications'],
} as const;

async function getApplicationEnvironments(fastify: FastifyInstance) {
  fastify.get<{
    Params: FromSchema<typeof paramsSchema>;
    Reply: PreSerializedFromSchema<(typeof schema.response)[200]>;
  }>('/applications/:applicationId/environments', { schema }, async (request, reply) => {
    const result = await fastify.services.environmentsService.listEnvironments({
      filters: {
        applicationId: request.params.applicationId,
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

    reply.code(200).send(result.data);
  });
}

export default getApplicationEnvironments;
