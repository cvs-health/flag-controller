// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../../../../types/preSerializedFromSchema.js';

import { segmentSchemaJoined } from 'schemas/segments.js';

const paramsSchema = {
  type: 'object',
  properties: {
    applicationName: { type: 'string' },
    segmentKey: { type: 'string' },
  },
  required: ['applicationName', 'segmentKey'],
} as const;
const schema = {
  description: 'Gets a segment for an application',
  response: {
    200: segmentSchemaJoined,
  },
  params: paramsSchema,
  tags: ['applications'],
} as const;

type Params = FromSchema<typeof paramsSchema>;
type Response = PreSerializedFromSchema<(typeof schema)['response'][200]>;

async function getApplicationSegment(fastify: FastifyInstance) {
  fastify.get<{ Params: Params; Reply: Response }>(
    '/applications/:applicationName/segments/:segmentKey',
    { schema },
    async (request, reply) => {
      const segmentsResult = await fastify.services.segmentsService.getSegmentByApplicationNameAndKey(
        request.params.applicationName,
        request.params.segmentKey,
      );

      reply.code(200).send(segmentsResult);
    },
  );
}

export default getApplicationSegment;
