// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagType, FeatureFlagTypeToPrimitive } from './featureFlags';

export interface FeatureFlagVariation<T extends FeatureFlagType> {
  [key: string]: FeatureFlagTypeToPrimitive<T>;
}

export interface FlagVariationsTableColumns {
  createdAt: string;
  deletedAt: string | null;
  flagId: string;
  id: string;
  key: string;
  updatedAt: string;
  value: FeatureFlagTypeToPrimitive<FeatureFlagType>;
}

export type CreateVariationPayload = Pick<FlagVariationsTableColumns, 'flagId' | 'key' | 'value'>;
export type UpdateVariationPayload = Pick<FlagVariationsTableColumns, 'id' | 'key' | 'value'>;
