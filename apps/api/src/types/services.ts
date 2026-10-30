// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ApplicationsService } from 'services/applicationsService.js';
import type { AssertCanWrite, AuthorizationService } from 'services/authorizationService.js';
import type { EnvironmentsService } from 'services/environmentsService.js';
import type { FeatureFlagService } from 'services/featureFlagService.js';
import type { Filters, Sort, With } from './common.js';
import type { FlagEnvironmentsService } from 'services/flagEnvironmentsService.js';
import type { FlagdService } from 'services/flagdService.js';
import type { LogsService } from 'services/logsService.js';
import type { OrganizationsService } from 'services/organizationsService.js';
import type { Repositories } from 'utils/createRepositories.js';
import type { RulesService } from 'services/rulesService.js';
import type { SegmentsService } from 'services/segmentsService.js';
import type { TeamsService } from 'services/teamsService.js';
import type { UsersService } from 'services/usersService.js';
import type { VariationsService } from 'services/variationsService.js';
import type { WithTransaction } from 'utils/withTransaction.js';

export type ServicePaginationParams = {
  page: number;
  rows: number;
};

export interface ServiceListParams<S, F = Filters, W = With> {
  filters?: F;
  pagination: ServicePaginationParams;
  sort: Sort<S>;
  with?: W;
}

export interface ServiceOptions<W = With> {
  with?: W;
}

export interface ServiceDependencies {
  repositories: Repositories;
  withTransaction: WithTransaction;
  assertCanWrite: AssertCanWrite;
}

export interface Services {
  applicationsService: ApplicationsService;
  authorizationService: AuthorizationService;
  environmentsService: EnvironmentsService;
  featureFlagService: FeatureFlagService;
  flagEnvironmentsService: FlagEnvironmentsService;
  flagdService: FlagdService;
  logsService: LogsService;
  organizationsService: OrganizationsService;
  rulesService: RulesService;
  segmentsService: SegmentsService;
  teamsService: TeamsService;
  usersService: UsersService;
  variationsService: VariationsService;
}
