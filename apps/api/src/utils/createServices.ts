// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

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
import type { Repositories } from 'utils/createRepositories.js';
import type { WithTransaction } from 'utils/withTransaction.js';

function createServices(repositories: Repositories, withTransaction: WithTransaction) {
  const authorizationService = createAuthorizationService({ repositories });
  const deps = { repositories, withTransaction, assertCanWrite: authorizationService.assertCanWrite };
  const flagEnvironmentsService = createFlagEnvironmentsService(deps);

  return {
    applicationsService: createApplicationsService(deps),
    authorizationService,
    environmentsService: createEnvironmentsService(deps),
    featureFlagService: createFeatureFlagService({ ...deps, flagEnvironmentsService }),
    flagEnvironmentsService,
    flagdService: createFlagdService(deps),
    logsService: createLogsService(deps),
    organizationsService: createOrganizationsService(deps),
    rulesService: createRulesService(deps),
    segmentsService: createSegmentsService(deps),
    teamsService: createTeamsService(deps),
    usersService: createUsersService(deps),
    variationsService: createVariationsService(deps),
  };
}

export default createServices;
