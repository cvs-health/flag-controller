// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

const bodySchema = { type: 'array', items: { type: 'string' }, minItems: 1 } as const;
const paramsSchema = {
  type: 'object',
  properties: {
    teamId: { type: 'string' },
  },
  required: ['teamId'],
} as const;
const schema = {
  description: 'Adds members to a team',
  body: bodySchema,
  params: paramsSchema,
  tags: ['teams'],
} as const;

async function postTeamMembers(fastify: FastifyInstance) {
  fastify.post<{ Body: FromSchema<typeof bodySchema>; Params: FromSchema<typeof paramsSchema> }>(
    '/teams/:teamId/members',
    { schema },
    async (request, reply) => {
      await fastify.services.teamsService.addMembers(request.params.teamId, request.body, request.user.id);

      return reply.code(201).send();
    },
  );
}

export default postTeamMembers;
