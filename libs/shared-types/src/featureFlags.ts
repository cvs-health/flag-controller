// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export enum FeatureFlagType {
  Boolean = 'boolean',
  Integer = 'integer',
  String = 'string',
  Object = 'object',
}
export type FeatureFlagTypePrimitive = boolean | number | string | { [x: string]: unknown };
export type FeatureFlagTypeToPrimitive<T> = T extends FeatureFlagType.Boolean
  ? boolean
  : T extends FeatureFlagType.Integer
    ? number
    : T extends FeatureFlagType.String
      ? string
      : T extends FeatureFlagType.Object
        ? { [x: string]: unknown }
        : never;

export interface FeatureFlagsTableColumns {
  applicationId: string;
  archived: boolean;
  createdAt: string;
  deletedAt: string | null;
  description: string;
  id: string;
  key: string;
  type: FeatureFlagType;
  updatedAt: string;
}

export interface FeatureFlagsJoined extends FeatureFlagsTableColumns {
  applicationName: string;
}
