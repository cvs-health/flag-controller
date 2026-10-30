// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import { mockRepositories, mockServices, mockWithTransaction } from 'test/testUtils.js';
import servicesPlugin from '../services.js';

describe('servicesPlugin', () => {
  it('decorates the app with services', async () => {
    const app = fastify();

    function serviceShape(mock: object) {
      return Object.fromEntries(Object.keys(mock).map((key) => [key, expect.any(Function)]));
    }

    app.decorate('repositories', {
      applicationsRepository: mockRepositories.applicationsRepository,
      environmentsRepository: mockRepositories.environmentsRepository,
      featureFlagsRepository: mockRepositories.featureFlagsRepository,
      flagEnvironmentsRepository: mockRepositories.flagEnvironmentsRepository,
      flagVariationsRepository: mockRepositories.flagVariationsRepository,
      fractionalsRepository: mockRepositories.fractionalsRepository,
      logsRepository: mockRepositories.logsRepository,
      organizationsRepository: mockRepositories.organizationsRepository,
      rulesRepository: mockRepositories.rulesRepository,
      segmentsRepository: mockRepositories.segmentsRepository,
      teamsRepository: mockRepositories.teamsRepository,
      usersRepository: mockRepositories.usersRepository,
    });
    app.decorate('withTransaction', mockWithTransaction);
    await app.register(servicesPlugin);

    expect(app.services).toEqual({
      applicationsService: serviceShape(mockServices.applications),
      authorizationService: serviceShape(mockServices.authorization),
      environmentsService: serviceShape(mockServices.environments),
      featureFlagService: serviceShape(mockServices.featureFlags),
      flagEnvironmentsService: serviceShape(mockServices.flagEnvironments),
      variationsService: serviceShape(mockServices.variations),
      flagdService: serviceShape(mockServices.flagd),
      logsService: serviceShape(mockServices.logs),
      organizationsService: serviceShape(mockServices.organizations),
      rulesService: serviceShape(mockServices.rules),
      segmentsService: serviceShape(mockServices.segments),
      teamsService: serviceShape(mockServices.teams),
      usersService: serviceShape(mockServices.users),
    });
  });
});
