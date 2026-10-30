// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { EnvironmentKey } from './environments';
import type { FeatureFlagsTableColumns } from './featureFlags';

export interface FeatureFlagEnvironmentsTableColumns {
  createdAt: string;
  defaultServeId: string;
  enabled: boolean;
  environmentId: string;
  flagId: string;
  updatedAt: string;
}

export interface FeatureFlagEnvironmentsJoined extends FeatureFlagEnvironmentsTableColumns {
  defaultServeKey: string;
  environmentKey: EnvironmentKey;
  flag: Pick<FeatureFlagsTableColumns, 'applicationId' | 'key'>;
}
