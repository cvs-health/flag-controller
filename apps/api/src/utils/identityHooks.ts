// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { APIError } from 'better-auth/api';

import type { IdentityPolicy } from 'services/identityPolicy.js';
import { IdentityManagedError } from '../errors/AppError.js';

/** Better Auth answers its own endpoints, so the refusal is raised as its error type. */
function refuseAsApiError(check: () => void) {
  try {
    check();
  } catch (error) {
    if (error instanceof IdentityManagedError) {
      throw new APIError('FORBIDDEN', { code: error.code, message: error.detail });
    }
    throw error;
  }
}

/** Applies the identity modes to writes that reach Better Auth without the service layer. */
export function createIdentityHooks(policy: IdentityPolicy) {
  const refuseTeams = async () => refuseAsApiError(() => policy.assertLocallyManaged('teams'));
  const refuseMemberships = async () => refuseAsApiError(() => policy.assertLocallyManaged('memberships'));

  return {
    beforeCreateUser: async () => refuseAsApiError(policy.assertCanSignUp),
    organizationHooks: {
      beforeCreateTeam: refuseTeams,
      beforeUpdateTeam: refuseTeams,
      beforeDeleteTeam: refuseTeams,
      // Deleting the organization cascades to its teams and team members, without beforeDeleteTeam.
      beforeDeleteOrganization: refuseTeams,
      beforeAddTeamMember: refuseMemberships,
      beforeRemoveTeamMember: refuseMemberships,
      // Removing an organization member deletes their team memberships too, without beforeRemoveTeamMember.
      beforeRemoveMember: refuseMemberships,
      // Accepting an invitation with a teamId adds team members without beforeAddTeamMember.
      beforeCreateInvitation: refuseMemberships,
      // Refuses invitations created before teams became external.
      beforeAcceptInvitation: refuseMemberships,
    },
  };
}
