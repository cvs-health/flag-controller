// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';

import { userSchema } from 'schemas/users.js';
import { ColumnSortingDirection } from '../../types/common.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';

const schema = {
  description: 'Gets all users',
  response: {
    200: {
      type: 'array',
      items: userSchema,
    },
  },
  tags: ['users'],
} as const;

async function getUsers(fastify: FastifyInstance) {
  fastify.get('/users', { schema }, async (_request, reply) => {
    const result = await fastify.services.usersService.listUsers({
      pagination: {
        page: 1,
        rows: PAGINATION_NO_LIMIT,
      },
      sort: {
        field: 'name',
        direction: ColumnSortingDirection.ASC,
      },
    });

    reply.code(200).send(result.data);
  });
}

export default getUsers;
