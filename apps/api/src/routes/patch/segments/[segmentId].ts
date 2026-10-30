// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import { problemSchema } from 'schemas/responses.js';
import { segmentSchema } from 'schemas/segments.js';
import type { PreSerializedFromSchema } from '../../../types/preSerializedFromSchema.js';

interface Reply {
  200: PreSerializedFromSchema<(typeof schema.response)[200]>;
  404: FromSchema<typeof problemSchema>;
  500: FromSchema<typeof problemSchema>;
}

const paramsSchema = {
  type: 'object',
  properties: {
    segmentId: { type: 'string' },
  },
  required: ['segmentId'],
} as const;
const bodySchema = {
  type: 'object',
  properties: {
    description: { type: 'string' },
  },
} as const;
const schema = {
  description: 'Updates a segment',
  response: {
    200: segmentSchema,
    400: problemSchema,
    404: problemSchema,
    500: problemSchema,
  },
  params: paramsSchema,
  body: bodySchema,
  tags: ['segments'],
};

async function patchSegment(fastify: FastifyInstance) {
  fastify.patch<{
    Body: FromSchema<typeof bodySchema>;
    Reply: Reply;
    Params: FromSchema<typeof paramsSchema>;
  }>('/segments/:segmentId', { schema }, async (request, reply) => {
    const result = await fastify.services.segmentsService.updateSegment(
      request.params.segmentId,
      request.body,
      request.user.id,
    );
    return reply.code(200).send(result);
  });
}

export default patchSegment;
