// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import { Ajv } from 'ajv';
import { default as formatsPlugin } from 'ajv-formats';

import { problemSchema } from 'schemas/responses.js';
import { createFeatureFlagRuleSchema, createSegmentRuleSchema, ruleSchema } from 'schemas/rules.js';

const ajv = new Ajv({
  coerceTypes: false,
});

formatsPlugin.default(ajv);

const bodySchema = {
  type: 'array',
  items: {
    anyOf: [createFeatureFlagRuleSchema, createSegmentRuleSchema],
  },
  minItems: 1,
} as const;
const schema = {
  description: 'Creates rules',
  body: bodySchema,
  response: {
    200: { type: 'array', items: ruleSchema },
    400: problemSchema,
    500: problemSchema,
  },
  tags: ['rules'],
};

async function postRules(fastify: FastifyInstance) {
  fastify.post<{
    Body: FromSchema<typeof schema.body>;
  }>('/rules', { schema, validatorCompiler: ({ schema }) => ajv.compile(schema) }, async (request, reply) => {
    const result = await fastify.services.rulesService.createMany(request.body, request.user.id);

    reply.code(200).send(result);
  });
}

export default postRules;
