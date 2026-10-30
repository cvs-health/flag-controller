// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import cors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import Fastify, { type FastifyServerOptions } from 'fastify';

import drizzlePlugin from './plugins/drizzle.js';
import { fastifyOtel } from './plugins/otel.js';
import repositoriesPlugin from './plugins/repositories.js';
import servicesPlugin from './plugins/services.js';
import { handleNotFound, handleRouteError } from './utils/errorHandler.js';
import getCorsOrigins from './utils/getCorsOrigins.js';

export const options = {
  logger: true,
};

async function build(options: FastifyServerOptions) {
  const fastify = Fastify(options);
  const corsOrigin = getCorsOrigins();

  fastify.register(fastifySwagger, {
    openapi: {
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });
  fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
  });
  fastify.register(cors, {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
    origin: corsOrigin,
  });

  await fastify.register(drizzlePlugin);
  await fastify.register(repositoriesPlugin);
  await fastify.register(servicesPlugin);

  fastify.setErrorHandler(handleRouteError);
  fastify.setNotFoundHandler(handleNotFound);

  if (fastifyOtel) {
    await fastify.register(fastifyOtel.plugin());
  }

  const { default: setup } = await import('./utils/setup.js');

  await setup(fastify);

  return fastify;
}

export default build;
