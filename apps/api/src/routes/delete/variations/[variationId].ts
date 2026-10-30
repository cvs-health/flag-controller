// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Ajv } from 'ajv';
import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../../types/preSerializedFromSchema.js';

import { problemSchema } from 'schemas/responses.js';
import { variationSchema } from 'schemas/variations.js';

interface Reply {
  200: PreSerializedFromSchema<(typeof schema.response)[200]>;
  400: FromSchema<typeof problemSchema>;
  404: FromSchema<typeof problemSchema>;
  500: FromSchema<typeof problemSchema>;
}

const paramsSchema = {
  type: 'object',
  properties: {
    variationId: { type: 'string' },
  },
  required: ['variationId'],
} as const;
const schema = {
  description: 'Soft deletes a variation',
  response: {
    200: variationSchema,
    400: problemSchema,
    404: problemSchema,
    500: problemSchema,
  },
  params: paramsSchema,
  tags: ['variations'],
};

const ajv = new Ajv({
  coerceTypes: false,
});

async function deleteVariation(fastify: FastifyInstance) {
  fastify.delete<{
    Params: FromSchema<typeof schema.params>;
    Reply: Reply;
  }>(
    '/variations/:variationId',
    {
      schema,
      validatorCompiler: ({ schema }) => ajv.compile(schema),
    },
    async (request, reply) => {
      const result = await fastify.services.variationsService.deleteVariation(
        request.params.variationId,
        request.user.id,
      );

      return reply.code(200).send(result);
    },
  );
}

export default deleteVariation;
