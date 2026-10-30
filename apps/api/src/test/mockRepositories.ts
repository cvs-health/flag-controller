// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { drizzle } from 'drizzle-orm/node-postgres';
import { vi } from 'vitest';

import createApplicationsRepository from 'repositories/applicationsRepository.js';
import createEnvironmentsRepository from 'repositories/environmentsRepository.js';
import createFeatureFlagsRepository from 'repositories/featureFlagsRepository.js';
import createFlagEnvironmentsRepository from 'repositories/flagEnvironmentsRepository.js';
import createFlagVariationsRepository from 'repositories/flagVariationsRepository.js';
import createFractionalsRepository from 'repositories/fractionalsRepository.js';
import createLogsRepository from 'repositories/logsRepository.js';
import createOrganizationsRepository from 'repositories/organizationsRepository.js';
import createRulesRepository from 'repositories/rulesRepository.js';
import createSegmentsRepository from 'repositories/segmentsRepository.js';
import createTeamsRepository from 'repositories/teamsRepository.js';
import createUsersRepository from 'repositories/usersRepository.js';
import type { WithTransaction } from 'utils/withTransaction.js';
import type { Tx } from '../types/db.js';
import type { MockedMethods } from '../types/tests.js';

function mockRepository<R extends object>(repository: R): MockedMethods<R> {
  const out = {} as MockedMethods<R>;

  for (const key of Object.keys(repository) as Array<keyof MockedMethods<R>>) {
    out[key] = vi.fn() as MockedMethods<R>[typeof key];
  }

  return out;
}

export const createRepositoryMocks = () => ({
  applicationsRepository: mockRepository(createApplicationsRepository(drizzle.mock())),
  environmentsRepository: mockRepository(createEnvironmentsRepository(drizzle.mock())),
  flagEnvironmentsRepository: mockRepository(createFlagEnvironmentsRepository(drizzle.mock())),
  featureFlagsRepository: mockRepository(createFeatureFlagsRepository(drizzle.mock())),
  fractionalsRepository: mockRepository(createFractionalsRepository(drizzle.mock())),
  logsRepository: mockRepository(createLogsRepository(drizzle.mock())),
  organizationsRepository: mockRepository(createOrganizationsRepository(drizzle.mock())),
  rulesRepository: mockRepository(createRulesRepository(drizzle.mock())),
  segmentsRepository: mockRepository(createSegmentsRepository(drizzle.mock())),
  teamsRepository: mockRepository(createTeamsRepository(drizzle.mock())),
  flagVariationsRepository: mockRepository(createFlagVariationsRepository(drizzle.mock())),
  usersRepository: mockRepository(createUsersRepository(drizzle.mock())),
});

type RepoMocks = ReturnType<typeof createRepositoryMocks>;

/**
 * Builds a passthrough `WithTransaction` for tests: it invokes the callback
 * immediately with the given mock repositories and a stub transaction handle,
 * so no real database transaction is opened.
 */
export const createMockWithTransaction =
  (repositories: RepoMocks): WithTransaction =>
  (fn) =>
    fn(repositories, {} as Tx);

let singleton: RepoMocks | null = null;

export function getMockRepositories(): RepoMocks {
  if (!singleton) singleton = createRepositoryMocks();
  return singleton;
}
