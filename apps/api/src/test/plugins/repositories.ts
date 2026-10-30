// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

import createRepositories from 'utils/createRepositories.js';
import { createWithTransaction } from 'utils/withTransaction.js';
import type { Repositories } from 'utils/createRepositories.js';

export type TestRepositories = Partial<Repositories>;

function repositoriesDecoration(repositories: TestRepositories = {}) {
  return (fastify: FastifyInstance, _opts: FastifyPluginOptions, done: (err?: Error) => void) => {
    fastify.decorate('withTransaction', createWithTransaction(fastify.drizzle));
    fastify.decorate('repositories', {
      ...createRepositories(fastify.drizzle),
      ...repositories,
    });

    done();
  };
}

function repositoriesPlugin(repositories: TestRepositories = {}) {
  return fastifyPlugin(repositoriesDecoration(repositories));
}

export default repositoriesPlugin;
