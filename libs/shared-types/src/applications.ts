// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export interface AppRegistryApplication {
  createTimestamp: string;
  createUser: string;
  id: string;
  name: string;
  teamId: string;
  type: string;
  updateTimestamp: string;
  updateUser: string;
  version: number;
}

export interface ApplicationsTableColumns {
  createdAt: string;
  deletedAt: string | null;
  description: string;
  id: string;
  name: string;
  teamId: string;
  updatedAt: string;
}

export interface ApplicationsJoined extends ApplicationsTableColumns {
  teamName: string;
}
