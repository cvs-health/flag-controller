// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export interface AppRegistryTeam {
  createTimestamp: string;
  createUser: string;
  id: string;
  name: string;
  type: string;
  updateTimestamp: string;
  updateUser: string;
  version: number;
}

export interface TeamsTableColumns {
  createdAt: string;
  deletedAt: string | null;
  id: string;
  name: string;
  organizationId: string;
  updatedAt: string;
}

export enum TeamDeleteErrorCode {
  HasApplications = 'team_has_applications',
  LastTeam = 'cannot_delete_last_team',
}
