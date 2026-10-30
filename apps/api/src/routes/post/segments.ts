// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import { createSegmentSchema, segmentSchema } from 'schemas/segments.js';

const bodySchema = {
  type: 'array',
  items: createSegmentSchema,
} as const;
const schema = {
  description: 'Creates segments',
  body: bodySchema,
  response: {
    200: {
      type: 'array',
      items: segmentSchema,
    },
  },
  tags: ['segments'],
};

async function postSegments(fastify: FastifyInstance) {
  fastify.post<{
    Body: FromSchema<typeof bodySchema>;
  }>('/segments', { schema }, async (request, reply) => {
    const result = await fastify.services.segmentsService.createManySegments(request.body, request.user.id);

    reply.code(200).send(result);
  });
}

export default postSegments;
