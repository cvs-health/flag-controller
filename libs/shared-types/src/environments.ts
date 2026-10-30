// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export enum EnvironmentKey {
  Development = 'development',
  Production = 'production',
}

export interface EnvironmentTableColumns {
  applicationId: string;
  createdAt: string;
  id: string;
  key: EnvironmentKey;
  updatedAt: string;
}
