// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';

import createServices from 'utils/createServices.js';

const servicesPlugin = fp(async (server: FastifyInstance) => {
  const services = createServices(server.repositories, server.withTransaction);
  server.decorate('services', services);
});

export default servicesPlugin;
