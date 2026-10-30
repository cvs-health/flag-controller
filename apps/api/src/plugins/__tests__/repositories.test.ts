// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import { mockRepositories } from 'test/testUtils.js';
import repositoriesPlugin from '../repositories.js';

describe('repositoriesPlugin', () => {
  it('decorates the app with all repositories', async () => {
    const app = fastify();

    function repositoryShape(mock: object) {
      return Object.fromEntries(Object.keys(mock).map((key) => [key, expect.any(Function)]));
    }

    await app.register(repositoriesPlugin);

    expect(app.repositories).toEqual({
      applicationsRepository: repositoryShape(mockRepositories.applicationsRepository),
      environmentsRepository: repositoryShape(mockRepositories.environmentsRepository),
      featureFlagsRepository: repositoryShape(mockRepositories.featureFlagsRepository),
      flagEnvironmentsRepository: repositoryShape(mockRepositories.flagEnvironmentsRepository),
      flagVariationsRepository: repositoryShape(mockRepositories.flagVariationsRepository),
      fractionalsRepository: repositoryShape(mockRepositories.fractionalsRepository),
      logsRepository: repositoryShape(mockRepositories.logsRepository),
      organizationsRepository: repositoryShape(mockRepositories.organizationsRepository),
      rulesRepository: repositoryShape(mockRepositories.rulesRepository),
      segmentsRepository: repositoryShape(mockRepositories.segmentsRepository),
      teamsRepository: repositoryShape(mockRepositories.teamsRepository),
      usersRepository: repositoryShape(mockRepositories.usersRepository),
    });
  });
});
