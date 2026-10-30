// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import { teamSchema } from 'schemas/teams.js';

const paramsSchema = {
  type: 'object',
  properties: {
    teamName: { type: 'string' },
  },
  required: ['teamName'],
} as const;
const schema = {
  description: "Gets a team's details",
  response: {
    200: teamSchema,
  },
  params: paramsSchema,
  tags: ['teams'],
} as const;

async function getTeam(fastify: FastifyInstance) {
  fastify.get<{
    Params: FromSchema<typeof paramsSchema>;
  }>('/teams/:teamName', { schema }, async (request, reply) => {
    const result = await fastify.services.teamsService.getTeamByName(request.params.teamName);

    reply.code(200).send(result);
  });
}

export default getTeam;
