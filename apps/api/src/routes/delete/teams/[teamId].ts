// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

interface Reply {
  204: undefined;
}

const paramsSchema = {
  type: 'object',
  properties: {
    teamId: { type: 'string' },
  },
  required: ['teamId'],
} as const;

const schema = {
  description: 'Soft-deletes a team by ID',
  response: {
    204: {},
  },
  params: paramsSchema,
  tags: ['teams'],
};

async function deleteTeam(fastify: FastifyInstance) {
  fastify.delete<{
    Reply: Reply;
    Params: FromSchema<typeof paramsSchema>;
  }>('/teams/:teamId', { schema }, async (request, reply) => {
    await fastify.services.teamsService.deleteTeam(request.params.teamId, request.user.id, false);

    return reply.code(204).send();
  });
}

export default deleteTeam;
