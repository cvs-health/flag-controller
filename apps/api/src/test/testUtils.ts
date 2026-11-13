// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { IdentityModes } from 'shared-types';
import { vi } from 'vitest';

import createApplicationsService from 'services/applicationsService.js';
import createAuthorizationService, { AuthorizationDenialReason } from 'services/authorizationService.js';
import createEnvironmentsService from 'services/environmentsService.js';
import createFeatureFlagService from 'services/featureFlagService.js';
import createFlagEnvironmentsService from 'services/flagEnvironmentsService.js';
import createFlagdService from 'services/flagdService.js';
import { createIdentityPolicy } from 'services/identityPolicy.js';
import createLogsService from 'services/logsService.js';
import createOrganizationsService from 'services/organizationsService.js';
import createRulesService from 'services/rulesService.js';
import createSegmentsService from 'services/segmentsService.js';
import createTeamsService from 'services/teamsService.js';
import createUsersService from 'services/usersService.js';
import createVariationsService from 'services/variationsService.js';
import { ForbiddenError } from '../errors/AppError.js';
import { createMockWithTransaction, getMockRepositories } from './mockRepositories.js';
import { getMockServices } from './mockServices.js';

export const mockServices = getMockServices();
export const mockRepositories = getMockRepositories();

export const mockWithTransaction = createMockWithTransaction(mockRepositories);
export const mockAssertCanWrite = vi.fn();

/**
 * Standard rejection value for `mockAssertCanWrite` in fail-closed authorization tests.
 * Matches the shape of the ForbiddenError that real `assertCanWrite` throws.
 */
export const notAMemberError = (): ForbiddenError =>
  new ForbiddenError({
    message: 'You are not a member of the team that owns this resource',
    context: { reason: AuthorizationDenialReason.NotAMember },
  });
export const localIdentityModes = {
  users: 'local',
  teams: 'local',
  memberships: 'local',
  applications: 'local',
} as const;

const serviceConfig = {
  repositories: mockRepositories,
  withTransaction: mockWithTransaction,
  assertCanWrite: mockAssertCanWrite,
  identityPolicy: createIdentityPolicy(localIdentityModes),
};

const flagEnvironmentsService = createFlagEnvironmentsService(serviceConfig);

export const createServiceWithMocks = {
  applications: createApplicationsService(serviceConfig),
  authorization: createAuthorizationService(serviceConfig),
  environments: createEnvironmentsService(serviceConfig),
  featureFlag: createFeatureFlagService({
    ...serviceConfig,
    flagEnvironmentsService,
  }),
  flagEnvironments: flagEnvironmentsService,
  flagd: createFlagdService(serviceConfig),
  logs: createLogsService(serviceConfig),
  organizations: createOrganizationsService(serviceConfig),
  rules: createRulesService(serviceConfig),
  segments: createSegmentsService(serviceConfig),
  teams: createTeamsService(serviceConfig),
  users: createUsersService(serviceConfig),
  variations: createVariationsService(serviceConfig),
};

/** Services whose writes follow the given identity modes, for per-mode tests. Unset entities stay local. */
export function createServicesWithModes(modes: Partial<IdentityModes>) {
  const config = { ...serviceConfig, identityPolicy: createIdentityPolicy({ ...localIdentityModes, ...modes }) };

  return { applications: createApplicationsService(config), teams: createTeamsService(config) };
}
