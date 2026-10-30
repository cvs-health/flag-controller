// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../types/preSerializedFromSchema.js';

import getFieldDirection from 'utils/getFieldDirection.js';
import type { segments } from 'db/schema/segments.js';
import { resolveRequestApplicationIds } from 'utils/requestAccessContext.js';
import { responseMetadataSchema } from 'schemas/responses.js';
import { segmentListSchema } from 'schemas/segments.js';

const defaultSort = 'updatedAt:desc';
const querystringSchema = {
  type: 'object',
  properties: {
    page: { type: 'number' },
    rows: { type: 'number' },
    search: { type: 'string' },
    sort: {
      type: 'string',
      pattern: '^[a-zA-Z]+:(asc|desc)$',
      default: defaultSort,
    },
  },
  required: ['page', 'rows'],
} as const;

const schema = {
  description: 'Gets segments',
  response: {
    200: {
      type: 'object',
      properties: {
        data: segmentListSchema,
        metadata: responseMetadataSchema,
      },
    },
  },
  querystring: querystringSchema,
  tags: ['segments'],
} as const;

async function getSegments(fastify: FastifyInstance) {
  fastify.get<{
    Querystring: FromSchema<typeof querystringSchema>;
    Reply: PreSerializedFromSchema<(typeof schema.response)[200]>;
  }>('/segments', { schema }, async (request, reply) => {
    const sort = request.query.sort;
    const [field, direction] = getFieldDirection<typeof segments.$inferSelect>(sort);
    const applicationIds = await resolveRequestApplicationIds(fastify, request);

    const segmentsResult = await fastify.services.segmentsService.listSegments({
      filters: {
        applicationIds,
        search: request.query.search,
      },
      pagination: {
        page: request.query.page,
        rows: request.query.rows,
      },
      sort: {
        direction,
        field,
      },
      with: {
        flagTargetCount: true,
      },
    });

    reply.code(200).send(segmentsResult);
  });
}

export default getSegments;
