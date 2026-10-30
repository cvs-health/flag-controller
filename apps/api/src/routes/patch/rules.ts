// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import { Ajv } from 'ajv';
import { default as formatsPlugin } from 'ajv-formats';

import { problemSchema } from 'schemas/responses.js';
import { ruleSchema, updateFeatureFlagRuleSchema, updateSegmentRuleSchema } from 'schemas/rules.js';

const ajv = new Ajv({
  coerceTypes: false,
});

formatsPlugin.default(ajv);

const bodySchema = {
  type: 'array',
  items: {
    anyOf: [updateSegmentRuleSchema, updateFeatureFlagRuleSchema],
  },
} as const;
const schema = {
  description: 'Updates rules',
  body: bodySchema,
  response: {
    200: { type: 'array', items: ruleSchema },
    404: problemSchema,
    500: problemSchema,
  },
  tags: ['rules'],
};

async function patchRules(fastify: FastifyInstance) {
  fastify.patch<{
    Body: FromSchema<typeof bodySchema>;
  }>('/rules', { schema, validatorCompiler: ({ schema }) => ajv.compile(schema) }, async (request, reply) => {
    const result = await fastify.services.rulesService.updateMany(request.body, request.user.id);

    reply.code(200).send(result);
  });
}

export default patchRules;
