// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { TYPES } from '@carbon/react/lib/components/Tag/Tag';
import { FeatureFlagType } from 'shared-types';

import { featureFlagTypeLabels } from '../../constants/common';
import { Tag } from '../Carbon';

interface FeatureFlagTypeTagProps {
  type: FeatureFlagType;
}

const flagTypeColors = {
  [FeatureFlagType.Boolean]: 'blue',
  [FeatureFlagType.String]: 'magenta',
  [FeatureFlagType.Integer]: 'green',
  [FeatureFlagType.Object]: 'purple',
};

/**
 * Used to display the type of a feature flag by Tag/color combination.
 */
export function FeatureFlagTypeTag({ type }: FeatureFlagTypeTagProps) {
  return <Tag type={flagTypeColors[type] as keyof typeof TYPES}>{featureFlagTypeLabels[type]}</Tag>;
}
