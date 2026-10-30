// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagType, FeatureFlagTypePrimitive, FeatureFlagVariation } from 'shared-types';

export interface Variation {
  applicationName: string;
  createdAt: string;
  flagKey: string;
  id: string;
  key: string;
  updatedAt: string;
  value: FeatureFlagTypePrimitive;
}

export interface UpdatedVariation extends Omit<Variation, 'createdAt' | 'updatedAt' | 'applicationName' | 'flagKey'> {
  value: string;
  id: string;
  created?: boolean;
  removed?: boolean;
}

export type NewVariation = Omit<UpdatedVariation, 'id' | 'created' | 'removed'>;

export type ChangedVariation = Omit<UpdatedVariation, 'created' | 'removed'>;

export interface VariationLegacy {
  id: string;
  list: FeatureFlagVariation<FeatureFlagType>;
}
