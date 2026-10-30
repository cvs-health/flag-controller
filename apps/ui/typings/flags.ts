// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { EnvironmentKey, FeatureFlagType } from 'shared-types';

export interface FeatureFlagsFilters {
  archived: boolean;
  createdAtEndDate: string;
  createdAtStartDate: string;
  enabledIn: EnvironmentKey[];
  featureFlagTypes: FeatureFlagType[];
  updatedAtEndDate: string;
  updatedAtStartDate: string;
}

export interface FeatureFlagListItem {
  applicationId: string;
  applicationName: string;
  archived: boolean;
  createdAt: string;
  enabled: Record<string, boolean>;
  key: string;
  type: FeatureFlagType;
  updatedAt: string;
}
