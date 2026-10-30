// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

import createServices from 'utils/createServices.js';
import type { Services } from '../../types/services.js';

export type TestServices = Partial<Services>;

function servicesDecoration(services: TestServices = {}) {
  return (fastify: FastifyInstance, _opts: FastifyPluginOptions, done: (err?: Error) => void) => {
    fastify.decorate('services', {
      ...createServices(fastify.repositories, fastify.withTransaction),
      ...services,
    } as FastifyInstance['services']);

    done();
  };
}

function servicesPlugin(services: TestServices = {}) {
  return fastifyPlugin(servicesDecoration(services));
}

export default servicesPlugin;
