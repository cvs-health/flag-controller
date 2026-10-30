// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagType, FeatureFlagVariation } from 'shared-types';

export interface VariationsByFeatureFlagKey {
  [key: string]: FeatureFlagVariation<FeatureFlagType>;
}

export interface VariationListItem {
  featureFlagKey: string;
  list?: FeatureFlagVariation<FeatureFlagType>;
}
