// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../../../types/preSerializedFromSchema.js';

import getFieldDirection from 'utils/getFieldDirection.js';
import type { segments } from 'db/schema/segments.js';
import { responseMetadataSchema } from 'schemas/responses.js';
import { segmentListSchema } from 'schemas/segments.js';

const defaultSort = 'updatedAt:desc';
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
  description: 'Gets segments for an application',
  response: {
    200: {
      type: 'object',
      properties: {
        data: segmentListSchema,
        metadata: responseMetadataSchema,
      },
    },
  },
  params: paramsSchema,
  querystring: querystringSchema,
  tags: ['applications'],
} as const;

type Params = FromSchema<typeof paramsSchema>;
type Query = FromSchema<typeof querystringSchema>;
type Response = PreSerializedFromSchema<(typeof schema)['response'][200]>;

async function getApplicationSegments(fastify: FastifyInstance) {
  fastify.get<{ Params: Params; Querystring: Query; Reply: Response }>(
    '/applications/:applicationId/segments',
    { schema },
    async (request, reply) => {
      const sort = request.query.sort;
      const [field, direction] = getFieldDirection<typeof segments.$inferSelect>(sort);

      const segmentsResult = await fastify.services.segmentsService.listSegments({
        filters: {
          applicationIds: [request.params.applicationId],
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
    },
  );
}

export default getApplicationSegments;
