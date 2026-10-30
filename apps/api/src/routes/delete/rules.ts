// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import { problemSchema } from 'schemas/responses.js';
import { ruleSchema } from 'schemas/rules.js';

const bodySchema = {
  type: 'array',
  items: {
    type: 'string',
  },
} as const;
const schema = {
  description: 'Deletes rules',
  body: bodySchema,
  response: {
    200: { type: 'array', items: ruleSchema },
    404: problemSchema,
    500: problemSchema,
  },
  tags: ['rules'],
};

async function deleteRules(fastify: FastifyInstance) {
  fastify.delete<{
    Body: FromSchema<typeof bodySchema>;
  }>('/rules', { schema }, async (request, reply) => {
    const result = await fastify.services.rulesService.deleteMany(request.body, request.user.id);

    reply.code(200).send(result);
  });
}

export default deleteRules;
