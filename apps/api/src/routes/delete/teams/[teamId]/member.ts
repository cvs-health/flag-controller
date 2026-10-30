// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

const paramsSchema = {
  type: 'object',
  properties: {
    teamId: { type: 'string' },
    userId: { type: 'string' },
  },
  required: ['teamId', 'userId'],
} as const;
const schema = {
  description: 'Removes a member from a team',
  params: paramsSchema,
  tags: ['teams'],
} as const;

async function deleteTeamMember(fastify: FastifyInstance) {
  fastify.delete<{ Params: FromSchema<typeof paramsSchema> }>(
    '/teams/:teamId/member/:userId',
    { schema },
    async (request, reply) => {
      await fastify.services.teamsService.removeMember(request.params.teamId, request.params.userId, request.user.id);

      return reply.code(204).send();
    },
  );
}

export default deleteTeamMember;
