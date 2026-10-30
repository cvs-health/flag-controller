// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

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
import type { DbOrTx } from '../types/db.js';

function createRepositories(db: DbOrTx) {
  return {
    applicationsRepository: createApplicationsRepository(db),
    environmentsRepository: createEnvironmentsRepository(db),
    featureFlagsRepository: createFeatureFlagsRepository(db),
    flagEnvironmentsRepository: createFlagEnvironmentsRepository(db),
    flagVariationsRepository: createFlagVariationsRepository(db),
    fractionalsRepository: createFractionalsRepository(db),
    logsRepository: createLogsRepository(db),
    organizationsRepository: createOrganizationsRepository(db),
    rulesRepository: createRulesRepository(db),
    segmentsRepository: createSegmentsRepository(db),
    teamsRepository: createTeamsRepository(db),
    usersRepository: createUsersRepository(db),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;

export default createRepositories;
