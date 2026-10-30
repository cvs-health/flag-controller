// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Ajv } from 'ajv';
import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../types/preSerializedFromSchema.js';

import { problemSchema } from 'schemas/responses.js';
import { createVariationSchema, variationSchema } from 'schemas/variations.js';

interface Reply {
  200: PreSerializedFromSchema<typeof response200Schema>;
  400: FromSchema<typeof problemSchema>;
  404: FromSchema<typeof problemSchema>;
  500: FromSchema<typeof problemSchema>;
}
const response200Schema = {
  type: 'array',
  items: variationSchema,
} as const;
const bodySchema = {
  type: 'array',
  items: createVariationSchema,
} as const;
const schema = {
  description: 'Creates variations',
  response: {
    200: response200Schema,
    400: problemSchema,
    404: problemSchema,
    500: problemSchema,
  },
  body: bodySchema,
  tags: ['variations'],
};

const ajv = new Ajv({
  coerceTypes: false,
});

async function postVariations(fastify: FastifyInstance) {
  fastify.post<{
    Body: FromSchema<typeof schema.body>;
    Reply: Reply;
  }>(
    '/variations',
    {
      schema,
      validatorCompiler: ({ schema }) => ajv.compile(schema),
    },
    async (request, reply) => {
      const result = await fastify.services.variationsService.createManyVariations(request.body, request.user.id);

      return reply.code(200).send(result);
    },
  );
}

export default postVariations;
