// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import Fastify from 'fastify';

import flagdSchema from 'schemas/flagd.json' with { type: 'json' };
import targetingSchema from 'schemas/targeting.json' with { type: 'json' };
import registerAllRoutes from 'utils/registerAllRoutes.js';
import checkSession from '../hooks/checkSession.js';
import { handleRouteError } from '../utils/errorHandler.js';
import { getMockRepositories } from './mockRepositories.js';
import { getMockServices } from './mockServices.js';
import drizzlePlugin from './plugins/drizzle.js';
import repositoriesPlugin, { type TestRepositories } from './plugins/repositories.js';
import servicesPlugin, { type TestServices } from './plugins/services.js';

export interface Configuration<D> {
  drizzle: D;
  repositories?: TestRepositories;
  services?: TestServices;
}

function build<D extends unknown[]>(configuration: Partial<Configuration<D>> = {}) {
  const fastify = Fastify();

  fastify.addSchema(flagdSchema);
  fastify.addSchema(targetingSchema);
  fastify.addHook('preHandler', checkSession);

  fastify.register(drizzlePlugin(configuration.drizzle));

  // Set up default repositories and services, allowing overrides
  const defaultRepositories = getMockRepositories();
  const defaultServices = getMockServices();

  const repositories: TestRepositories = {
    applicationsRepository:
      configuration.repositories?.applicationsRepository ?? defaultRepositories.applicationsRepository,
    environmentsRepository:
      configuration.repositories?.environmentsRepository ?? defaultRepositories.environmentsRepository,
    featureFlagsRepository:
      configuration.repositories?.featureFlagsRepository ?? defaultRepositories.featureFlagsRepository,
    flagEnvironmentsRepository:
      configuration.repositories?.flagEnvironmentsRepository ?? defaultRepositories.flagEnvironmentsRepository,
    flagVariationsRepository:
      configuration.repositories?.flagVariationsRepository ?? defaultRepositories.flagVariationsRepository,
    fractionalsRepository:
      configuration.repositories?.fractionalsRepository ?? defaultRepositories.fractionalsRepository,
    logsRepository: configuration.repositories?.logsRepository ?? defaultRepositories.logsRepository,
    organizationsRepository:
      configuration.repositories?.organizationsRepository ?? defaultRepositories.organizationsRepository,
    rulesRepository: configuration.repositories?.rulesRepository ?? defaultRepositories.rulesRepository,
    segmentsRepository: configuration.repositories?.segmentsRepository ?? defaultRepositories.segmentsRepository,
    teamsRepository: configuration.repositories?.teamsRepository ?? defaultRepositories.teamsRepository,
    usersRepository: configuration.repositories?.usersRepository ?? defaultRepositories.usersRepository,
  };

  const services: TestServices = {
    applicationsService: configuration.services?.applicationsService ?? defaultServices.applications,
    environmentsService: configuration.services?.environmentsService ?? defaultServices.environments,
    featureFlagService: configuration.services?.featureFlagService ?? defaultServices.featureFlags,
    flagEnvironmentsService: configuration.services?.flagEnvironmentsService ?? defaultServices.flagEnvironments,
    flagdService: configuration.services?.flagdService ?? defaultServices.flagd,
    logsService: configuration.services?.logsService ?? defaultServices.logs,
    organizationsService: configuration.services?.organizationsService ?? defaultServices.organizations,
    rulesService: configuration.services?.rulesService ?? defaultServices.rules,
    segmentsService: configuration.services?.segmentsService ?? defaultServices.segments,
    teamsService: configuration.services?.teamsService ?? defaultServices.teams,
    usersService: configuration.services?.usersService ?? defaultServices.users,
    variationsService: configuration.services?.variationsService ?? defaultServices.variations,
  };

  fastify.register(repositoriesPlugin(repositories));
  fastify.register(servicesPlugin(services));

  // Register global error handler
  fastify.setErrorHandler(handleRouteError);

  registerAllRoutes(fastify);

  return fastify;
}

export default build;
