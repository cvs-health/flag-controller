// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';

import { createWithTransaction } from 'utils/withTransaction.js';
import createRepositories from 'utils/createRepositories.js';

/**
 * Registers all repositories on the Fastify instance.
 * Repositories are stateless and created once at startup.
 * Depends on fastify.drizzle (must be registered after drizzlePlugin).
 */
const repositoriesPlugin = fp(async (server: FastifyInstance) => {
  const repositories = createRepositories(server.drizzle);

  server.decorate('withTransaction', createWithTransaction(server.drizzle));
  server.decorate('repositories', repositories);
});

export default repositoriesPlugin;
