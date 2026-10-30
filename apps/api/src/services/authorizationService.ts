// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { Repositories } from 'utils/createRepositories.js';
import { ForbiddenError } from '../errors/AppError.js';

export type AuthorizationService = ReturnType<typeof createAuthorizationService>;
export type AssertCanWrite = AuthorizationService['assertCanWrite'];

/**
 * The kinds of entity a write can be authorized against. Each is resolved up to its owning team
 * by the matching entity repository (see `findOwningTeamId`); `team` is the identity case.
 */
export type AuthorizedResource =
  | 'team'
  | 'application'
  | 'featureFlag'
  | 'segment'
  | 'environment'
  | 'variation'
  | 'rule';

export const AuthorizationDenialReason = {
  UnresolvedOwner: 'unresolved_owner',
  NotAMember: 'not_a_member',
} as const;
export type AuthorizationDenialReason = (typeof AuthorizationDenialReason)[keyof typeof AuthorizationDenialReason];

function createAuthorizationService({ repositories }: { repositories: Repositories }) {
  const {
    teamsRepository,
    applicationsRepository,
    featureFlagsRepository,
    segmentsRepository,
    environmentsRepository,
    flagVariationsRepository,
    rulesRepository,
  } = repositories;

  /**
   * Resolves an id up to the id of the team that owns it (`null` when it resolves to no team).
   * `team` is the identity case. Adding a writable entity: add its kind to `AuthorizedResource`
   * (the compiler then forces a `case` here) and give its repo a `findOwningTeamId(id)`.
   */
  const findOwningTeamId = (resource: AuthorizedResource, id: string): Promise<string | null> => {
    switch (resource) {
      case 'team':
        return Promise.resolve(id);
      case 'application':
        return applicationsRepository.findOwningTeamId(id);
      case 'featureFlag':
        return featureFlagsRepository.findOwningTeamId(id);
      case 'segment':
        return segmentsRepository.findOwningTeamId(id);
      case 'environment':
        return environmentsRepository.findOwningTeamId(id);
      case 'variation':
        return flagVariationsRepository.findOwningTeamId(id);
      case 'rule':
        return rulesRepository.findOwningTeamId(id);
    }
  };

  async function assertCanWrite(userId: string, resource: AuthorizedResource, id: string | string[]): Promise<void> {
    const ids = [...new Set(Array.isArray(id) ? id : [id])];
    if (ids.length === 0) return;

    const { teamIds } = await teamsRepository.getAccessScope(userId);
    const memberOf = new Set(teamIds);

    // Both denials share the generic detail: which one fired would reveal whether the resource exists.
    const owningTeamIds = await Promise.all(ids.map((entityId) => findOwningTeamId(resource, entityId)));
    for (const teamId of owningTeamIds) {
      if (teamId === null) {
        throw new ForbiddenError({
          message: 'Referenced resource could not be resolved to a team',
          context: { reason: AuthorizationDenialReason.UnresolvedOwner, resource },
        });
      }
      if (!memberOf.has(teamId)) {
        throw new ForbiddenError({
          message: 'You are not a member of the team that owns this resource',
          context: { reason: AuthorizationDenialReason.NotAMember, resource, teamId },
        });
      }
    }
  }

  return { assertCanWrite };
}

export default createAuthorizationService;
