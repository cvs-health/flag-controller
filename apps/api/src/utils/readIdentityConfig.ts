// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { IdentityModes } from 'shared-types';

import { fail, readBoolean, readChoice } from './authEnv.js';

const MODES = ['local', 'external'] as const;

/** `provisioned` lists the entities a configured source supplies, such as users from SCIM. */
export function readIdentityConfig(provisioned: readonly (keyof IdentityModes)[] = []) {
  const modes = {
    users: readChoice('IDENTITY_USERS_MODE', MODES, 'local'),
    teams: readChoice('IDENTITY_TEAMS_MODE', MODES, 'local'),
    applications: readChoice('IDENTITY_APPLICATIONS_MODE', MODES, 'local'),
  };

  const unprovisioned = (Object.keys(modes) as (keyof IdentityModes)[])
    .filter((entity) => modes[entity] === 'external' && !provisioned.includes(entity))
    .map((entity) => `IDENTITY_${entity.toUpperCase()}_MODE=external`);

  if (unprovisioned.length) {
    fail(`${unprovisioned.join(', ')} needs a provisioning source, and none is configured for it`);
  }

  // The default team only exists, and joining it is only allowed, when Flag Controller owns teams.
  const defaultTeamPossible = modes.teams === 'local';
  const defaultTeam = readBoolean('IDENTITY_DEFAULT_TEAM', defaultTeamPossible);

  if (defaultTeam && !defaultTeamPossible) {
    fail('IDENTITY_DEFAULT_TEAM=true needs IDENTITY_TEAMS_MODE=local');
  }

  return { modes, defaultTeam };
}

export type IdentityConfig = ReturnType<typeof readIdentityConfig>;
