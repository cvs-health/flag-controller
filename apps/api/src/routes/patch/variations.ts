// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import type { PreSerializedFromSchema } from '../../types/preSerializedFromSchema.js';
import { Ajv } from 'ajv';

import { problemSchema } from 'schemas/responses.js';
import { updateVariationSchema, variationSchema } from 'schemas/variations.js';

const response200Schema = { type: 'array', items: variationSchema } as const;
const bodyItemsSchema = {
  type: 'object',
  properties: {
    ...updateVariationSchema.properties,
    id: variationSchema.properties.id,
  },
  required: ['id'],
  minProperties: 2,
} as const;
const bodySchema = {
  type: 'array',
  items: bodyItemsSchema,
  minItems: 1,
} as const;
const schema = {
  description: 'Updates variations',
  body: bodySchema,
  response: {
    200: response200Schema,
    404: problemSchema,
    500: problemSchema,
  },
  tags: ['variations'],
};
const ajv = new Ajv({
  coerceTypes: false,
});

async function patchVariations(fastify: FastifyInstance) {
  fastify.patch<{
    Reply: PreSerializedFromSchema<(typeof schema.response)[200]>;
    Body: FromSchema<typeof schema.body>;
  }>(
    '/variations',
    {
      schema,
      validatorCompiler: ({ schema }) => ajv.compile(schema),
    },
    async (request, reply) => {
      const result = await fastify.services.variationsService.updateManyVariations(request.body, request.user.id);

      reply.code(200).send(result);
    },
  );
}

export default patchVariations;
