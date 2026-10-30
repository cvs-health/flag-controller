// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { vi } from 'vitest';

import createApplicationsService from 'services/applicationsService.js';
import createAuthorizationService from 'services/authorizationService.js';
import createEnvironmentsService from 'services/environmentsService.js';
import createFeatureFlagService from 'services/featureFlagService.js';
import createFlagEnvironmentsService from 'services/flagEnvironmentsService.js';
import createFlagdService from 'services/flagdService.js';
import createLogsService from 'services/logsService.js';
import createOrganizationsService from 'services/organizationsService.js';
import createRulesService from 'services/rulesService.js';
import createSegmentsService from 'services/segmentsService.js';
import createTeamsService from 'services/teamsService.js';
import createUsersService from 'services/usersService.js';
import createVariationsService from 'services/variationsService.js';
import type { MockedMethods } from '../types/tests.js';
import { createMockWithTransaction, createRepositoryMocks } from './mockRepositories.js';

function mockService<R extends object>(repository: R): MockedMethods<R> {
  const out = {} as MockedMethods<R>;

  for (const key of Object.keys(repository) as Array<keyof MockedMethods<R>>) {
    out[key] = vi.fn() as MockedMethods<R>[typeof key];
  }

  return out;
}

const repositoryMocks = createRepositoryMocks();
const noopWithTransaction = createMockWithTransaction(repositoryMocks);
const flagEnvironmentsServiceForMocks = createFlagEnvironmentsService({
  repositories: repositoryMocks,
  withTransaction: noopWithTransaction,
  assertCanWrite: vi.fn(),
});
const serviceConfig = { repositories: repositoryMocks, withTransaction: noopWithTransaction, assertCanWrite: vi.fn() };

export const createServiceMocks = () => ({
  applications: mockService(createApplicationsService(serviceConfig)),
  authorization: mockService(createAuthorizationService(serviceConfig)),
  environments: mockService(createEnvironmentsService(serviceConfig)),
  featureFlags: mockService(
    createFeatureFlagService({
      ...serviceConfig,
      flagEnvironmentsService: flagEnvironmentsServiceForMocks,
    }),
  ),
  flagEnvironments: mockService(flagEnvironmentsServiceForMocks),
  flagd: mockService(createFlagdService(serviceConfig)),
  logs: mockService(createLogsService(serviceConfig)),
  organizations: mockService(createOrganizationsService(serviceConfig)),
  rules: mockService(createRulesService(serviceConfig)),
  segments: mockService(createSegmentsService(serviceConfig)),
  teams: mockService(createTeamsService(serviceConfig)),
  users: mockService(createUsersService(serviceConfig)),
  variations: mockService(createVariationsService(serviceConfig)),
});

type ServiceMocks = ReturnType<typeof createServiceMocks>;

let singleton: ServiceMocks | null = null;

export function getMockServices(): ServiceMocks {
  if (!singleton) singleton = createServiceMocks();
  return singleton;
}
